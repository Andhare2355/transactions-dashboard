const pool = require('../db');
const { seedDatabase, fetchFromExternalAPI } = require('../services/seedService');

exports.initData = async (req, res) => {
  await seedDatabase();
  res.send({ message: 'Database seeded' });
};

// List transactions with accurate total count for pagination
exports.listTransactions = async (req, res) => {
  try {
    const { month = '3', search = '', page = 1, perPage = 10 } = req.query;
    const offset = (page - 1) * perPage;
    const searchText = `%${search.toLowerCase()}%`;
    // Get filtered transactions
    const query = `SELECT * FROM transactions WHERE EXTRACT(MONTH FROM date_of_sale) = $1
                   AND (LOWER(title) LIKE $2 OR LOWER(description) LIKE $2 OR price::text LIKE $2)
                   ORDER BY id LIMIT $3 OFFSET $4`;
    const values = [month, searchText, perPage, offset];
    const result = await pool.query(query, values);
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM transactions WHERE EXTRACT(MONTH FROM date_of_sale) = $1
                        AND (LOWER(title) LIKE $2 OR LOWER(description) LIKE $2 OR price::text LIKE $2)`;
    const countResult = await pool.query(countQuery, [month, searchText]);
    res.send({
      transactions: result.rows,
      total: parseInt(countResult.rows[0].count)
    });
  } catch (err) {
    res.status(500).send({ error: 'Failed to fetch transactions', details: err.message });
  }
};

exports.getStatistics = async (req, res) => {
  const { month = '3' } = req.query;
  const totalSales = await pool.query(`SELECT SUM(price) FROM transactions WHERE sold = true AND EXTRACT(MONTH FROM date_of_sale) = $1`, [month]);
  const soldItems = await pool.query(`SELECT COUNT(*) FROM transactions WHERE sold = true AND EXTRACT(MONTH FROM date_of_sale) = $1`, [month]);
  const unsoldItems = await pool.query(`SELECT COUNT(*) FROM transactions WHERE sold = false AND EXTRACT(MONTH FROM date_of_sale) = $1`, [month]);
  res.send({
    totalSales: parseFloat(totalSales.rows[0].sum || 0),
    soldItems: parseInt(soldItems.rows[0].count),
    unsoldItems: parseInt(unsoldItems.rows[0].count)
  });
};

exports.getBarChart = async (req, res) => {
  const { month = '3' } = req.query;
  const ranges = [
    [0, 100], [101, 200], [201, 300], [301, 400], [401, 500],
    [501, 600], [601, 700], [701, 800], [801, 900], [901, Infinity]
  ];
  const data = [];
  for (let [min, max] of ranges) {
    const query = `SELECT COUNT(*) FROM transactions WHERE EXTRACT(MONTH FROM date_of_sale) = $1 AND price >= $2 ${max !== Infinity ? 'AND price <= $3' : ''}`;
    const values = max === Infinity ? [month, min] : [month, min, max];
    const count = await pool.query(query, values);
    data.push({ range: `${min}-${max === Infinity ? 'above' : max}`, count: parseInt(count.rows[0].count) });
  }
  res.send(data);
};

exports.getPieChart = async (req, res) => {
  const { month = '3' } = req.query;
  const query = `SELECT category, COUNT(*) FROM transactions WHERE EXTRACT(MONTH FROM date_of_sale) = $1 GROUP BY category`;
  const result = await pool.query(query, [month]);
  res.send(result.rows);
};

// Combined API: use new listTransactions and map results
exports.getCombinedData = async (req, res) => {
  try {
    const { month = '3', search = '', page = 1, perPage = 10, offset } = req.query;
    const searchText = `%${search.toLowerCase()}%`;
    const pageOffset = offset !== undefined ? parseInt(offset) : (page - 1) * perPage;
    // If month is 0 or not provided, do not filter by month
    const filterByMonth = month && month !== '0' && month !== 0;
    // Transactions (with total count)
    let txQuery = `SELECT * FROM transactions WHERE (LOWER(title) LIKE $1 OR LOWER(description) LIKE $1 OR price::text LIKE $1)`;
    let countQuery = `SELECT COUNT(*) FROM transactions WHERE (LOWER(title) LIKE $1 OR LOWER(description) LIKE $1 OR price::text LIKE $1)`;
    let txValues = [searchText];
    let countValues = [searchText];
    if (filterByMonth) {
      txQuery += ` AND EXTRACT(MONTH FROM date_of_sale) = $2`;
      countQuery += ` AND EXTRACT(MONTH FROM date_of_sale) = $2`;
      txValues.push(month);
      countValues.push(month);
    }
    txQuery += ` ORDER BY id LIMIT $${txValues.length + 1} OFFSET $${txValues.length + 2}`;
    txValues.push(perPage);
    txValues.push(pageOffset);
    const txResult = await pool.query(txQuery, txValues);
    const countResult = await pool.query(countQuery, countValues);
    // Statistics
    let totalSales, soldItems, unsoldItems;
    if (filterByMonth) {
      totalSales = await pool.query(`SELECT SUM(price) FROM transactions WHERE sold = true AND EXTRACT(MONTH FROM date_of_sale) = $1`, [month]);
      soldItems = await pool.query(`SELECT COUNT(*) FROM transactions WHERE sold = true AND EXTRACT(MONTH FROM date_of_sale) = $1`, [month]);
      unsoldItems = await pool.query(`SELECT COUNT(*) FROM transactions WHERE sold = false AND EXTRACT(MONTH FROM date_of_sale) = $1`, [month]);
    } else {
      totalSales = await pool.query(`SELECT SUM(price) FROM transactions WHERE sold = true`);
      soldItems = await pool.query(`SELECT COUNT(*) FROM transactions WHERE sold = true`);
      unsoldItems = await pool.query(`SELECT COUNT(*) FROM transactions WHERE sold = false`);
    }
    const statistics = {
      totalSales: parseFloat(totalSales.rows[0].sum || 0),
      soldItems: parseInt(soldItems.rows[0].count),
      unsoldItems: parseInt(unsoldItems.rows[0].count)
    };
    // Bar chart
    const ranges = [
      [0, 100], [101, 200], [201, 300], [301, 400], [401, 500],
      [501, 600], [601, 700], [701, 800], [801, 900], [901, Infinity]
    ];
    const barData = [];
    for (let [min, max] of ranges) {
      let query = `SELECT COUNT(*) FROM transactions WHERE price >= $1`;
      let values = [min];
      if (max !== Infinity) {
        query += ` AND price <= $2`;
        values.push(max);
      }
      if (filterByMonth) {
        query += ` AND EXTRACT(MONTH FROM date_of_sale) = $${values.length + 1}`;
        values.push(month);
      }
      const count = await pool.query(query, values);
      barData.push({ range: `${min}-${max === Infinity ? 'above' : max}`, count: parseInt(count.rows[0].count) });
    }
    // Pie chart
    let pieQuery = `SELECT category, COUNT(*) FROM transactions`;
    let pieValues = [];
    if (filterByMonth) {
      pieQuery += ` WHERE EXTRACT(MONTH FROM date_of_sale) = $1 GROUP BY category`;
      pieValues.push(month);
    } else {
      pieQuery += ` GROUP BY category`;
    }
    const pieResult = await pool.query(pieQuery, pieValues);
    const pieData = pieResult.rows.map(row => ({ category: row.category, count: parseInt(row.count) }));
    res.send({
      transactions: txResult.rows,
      total: parseInt(countResult.rows[0].count),
      statistics,
      barChart: barData,
      pieChart: pieData
    });
  } catch (err) {
    res.status(500).send({ error: 'Failed to fetch combined data', details: err.message });
  }
};

exports.fetchExternal = async (req, res) => {
  return require('../services/seedService').fetchFromExternalAPI(req, res);
};
