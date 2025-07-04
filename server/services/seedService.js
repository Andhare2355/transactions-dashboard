const axios = require('axios');
const pool = require('../db');

// Simple endpoint to fetch and return data from the third-party API directly (no DB)
const fetchFromExternalAPI = async (req, res) => {
  try {
    const { data } = await axios.get(process.env.API_URL);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from external API', details: err.message });
  }
};

const seedDatabase = async () => {
  const { data } = await axios.get(process.env.API_URL);
  await pool.query('DELETE FROM transactions');
  const insertQuery = `
    INSERT INTO transactions (title, price, description, category, sold, date_of_sale, image)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;

  for (let txn of data) {
    await pool.query(insertQuery, [
      txn.title,
      txn.price,
      txn.description,
      txn.category,
      txn.sold,
      txn.dateOfSale,
      txn.image
    ]);
  }
};

module.exports = { seedDatabase, fetchFromExternalAPI };
