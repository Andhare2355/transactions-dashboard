import React, { useEffect, useState } from "react";
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);

export default function TransactionsTable({ month, setMonth }) {
  const [search, setSearch] = useState("");
  const [pendingSearch, setPendingSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [statistics, setStatistics] = useState({});
  const [barChart, setBarChart] = useState([]);
  const [pieChart, setPieChart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Month options
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to build query string
  const buildQuery = React.useCallback(() => {
    let query = `?perPage=10`;
    // Always start from the correct offset for pagination
    const offset = (page - 1) * 10;
    query += `&offset=${offset}`;
    if (month > 0 && month <= 12) query += `&month=${month}`;
    if (search) query += `&search=${encodeURIComponent(search)}`;
    return query;
  }, [month, search, page]);

  // When month, search, or page changes, fetch data
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/combined${buildQuery()}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data.transactions || []);
        setTotal(data.total || 0);
        setStatistics(data.statistics || {});
        setBarChart(data.barChart || []);
        setPieChart(data.pieChart || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [buildQuery, month, search, page]);

  // Reset to page 1 when month or search changes
  useEffect(() => {
    setPage(1);
  }, [month, search]);

  const handleSearch = () => {
    setSearch(pendingSearch);
    setPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Only increment/decrement page if within valid range
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNextPage = () => {
    if (page < Math.ceil(total / 10)) setPage(page + 1);
  };

  // Pie chart data for react-chartjs-2
  const pieData = {
    labels: pieChart.map(cat => `${cat.category || 'Unknown'} (${cat.count})`),
    datasets: [
      {
        data: pieChart.map(cat => cat.count),
        backgroundColor: [
          '#1976d2', '#43a047', '#ffd666', '#e53935', '#ff9800', '#8e24aa', '#00bcd4', '#cddc39', '#f44336', '#607d8b', '#ffb300', '#6d4c41'
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", padding: 32, background: '#f8fafc', borderRadius: 18, boxShadow: '0 4px 32px #e6e6e6' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 36, fontSize: 36, fontWeight: 800, color: '#1a237e', letterSpacing: 1 }}>Transactions Dashboard</h1>
      {/* Filters */}
      <div style={{ display: "flex", gap: 18, marginBottom: 32, alignItems: 'center', background: '#fff', borderRadius: 10, padding: 18, boxShadow: '0 1px 8px #eee' }}>
        <select
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          style={{ padding: 10, borderRadius: 6, border: '1.5px solid #bdbdbd', fontSize: 16, background: '#f5f7fa', marginRight: 12 }}
        >
          <option value={0}>All Months</option>
          {months.map((m, i) => (
            <option value={i + 1} key={m}>{m}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="🔍 Search by title, description, or price"
          value={pendingSearch}
          onChange={e => setPendingSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1, padding: 10, borderRadius: 6, border: '1.5px solid #bdbdbd', fontSize: 16, background: '#f5f7fa' }}
        />
        <button onClick={handleSearch} style={{ padding: '10px 28px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, boxShadow: '0 1px 4px #e3e3e3', cursor: 'pointer' }}>Search</button>
        {search && (
          <button onClick={() => { setPendingSearch(""); setSearch(""); }} style={{ marginLeft: 8, padding: '10px 18px', borderRadius: 6, background: '#e53935', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Clear</button>
        )}
      </div>

      {/* Statistics */}
      <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
        <div style={{ flex: 1, background: "linear-gradient(135deg,#e3f2fd,#bbdefb)", padding: 28, borderRadius: 14, textAlign: 'center', boxShadow: '0 2px 12px #e3e3e3' }}>
          <div style={{ fontSize: 16, color: '#607d8b', fontWeight: 600 }}>Total Sales</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#1976d2', marginTop: 8 }}>₹{statistics.totalSales || 0}</div>
        </div>
        <div style={{ flex: 1, background: "linear-gradient(135deg,#e8f5e9,#c8e6c9)", padding: 28, borderRadius: 14, textAlign: 'center', boxShadow: '0 2px 12px #e3e3e3' }}>
          <div style={{ fontSize: 16, color: '#388e3c', fontWeight: 600 }}>Sold Items</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#43a047', marginTop: 8 }}>{statistics.soldItems || 0}</div>
        </div>
        <div style={{ flex: 1, background: "linear-gradient(135deg,#ffebee,#ffcdd2)", padding: 28, borderRadius: 14, textAlign: 'center', boxShadow: '0 2px 12px #e3e3e3' }}>
          <div style={{ fontSize: 16, color: '#c62828', fontWeight: 600 }}>Unsold Items</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#e53935', marginTop: 8 }}>{statistics.unsoldItems || 0}</div>
        </div>
      </div>

      {/* Transactions Table */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px #e3e3e3', padding: 18, marginBottom: 36 }}>
        <div style={{ marginBottom: 16, fontWeight: 700, fontSize: 18, color: '#1976d2' }}>
          Total Transactions: {total} {month === 0 ? '(All Months)' : `(Month: ${months[month-1]})`}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 16 }}>
          <thead>
            <tr style={{ background: '#e3f2fd', borderBottom: '2px solid #90caf9' }}>
              <th style={{ padding: 14, textAlign: 'left', color: '#1976d2', fontWeight: 700 }}>Title</th>
              <th style={{ padding: 14, textAlign: 'left', color: '#1976d2', fontWeight: 700 }}>Description</th>
              <th style={{ padding: 14, color: '#1976d2', fontWeight: 700 }}>Price (₹)</th>
              <th style={{ padding: 14, color: '#1976d2', fontWeight: 700 }}>Category</th>
              <th style={{ padding: 14, color: '#1976d2', fontWeight: 700 }}>Sold</th>
              <th style={{ padding: 14, color: '#1976d2', fontWeight: 700 }}>Date of Sale</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, fontSize: 20, color: '#1976d2' }}>Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, fontSize: 20, color: '#c62828' }}>No transactions found.</td></tr>
            ) : (
              data.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #e3e3e3', background: tx.sold ? '#e8f5e9' : '#ffebee' }}>
                  <td style={{ padding: 12, fontWeight: 600 }}>{tx.title}</td>
                  <td style={{ padding: 12, color: '#607d8b', fontSize: 15 }}>{tx.description}</td>
                  <td style={{ padding: 12, textAlign: 'center', fontWeight: 700 }}>{tx.price}</td>
                  <td style={{ padding: 12, textAlign: 'center' }}>{tx.category}</td>
                  <td style={{ padding: 12, textAlign: 'center', fontWeight: 600, color: tx.sold ? '#43a047' : '#e53935' }}>{tx.sold ? "Yes" : "No"}</td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#1976d2' }}>{new Date(tx.date_of_sale).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center', marginTop: 24 }}>
          <button onClick={handlePrevPage} disabled={page === 1} style={{ padding: '10px 28px', borderRadius: 6, background: page === 1 ? '#e3e3e3' : '#1976d2', color: page === 1 ? '#888' : '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: page === 1 ? 'not-allowed' : 'pointer' }}>Previous</button>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#1976d2' }}>
            Page {page} of {Math.max(1, Math.ceil(total / 10))}
            {month === 0 && !search && ` (showing all from external API)`}
          </span>
          <button onClick={handleNextPage} disabled={data.length < 10 || page >= Math.ceil(total / 10)} style={{ padding: '10px 28px', borderRadius: 6, background: data.length < 10 || page >= Math.ceil(total / 10) ? '#e3e3e3' : '#1976d2', color: data.length < 10 || page >= Math.ceil(total / 10) ? '#888' : '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: data.length < 10 || page >= Math.ceil(total / 10) ? 'not-allowed' : 'pointer' }}>Next</button>
        </div>
      </div>

      {/* Bar Chart */}
      <h2 style={{ marginBottom: 16, color: '#1a237e', fontWeight: 800 }}>Price Range Bar Chart</h2>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 220, marginBottom: 40, background: '#f5f7fa', borderRadius: 14, padding: 24, boxShadow: '0 1px 8px #eee' }}>
        {barChart.map(bar => (
          <div key={bar.range} style={{ textAlign: "center", flex: 1 }}>
            <div style={{
              background: "#1976d2",
              height: `${bar.count * 12}px`,
              borderRadius: 6,
              marginBottom: 6,
              transition: 'height 0.3s'
            }} />
            <div style={{ fontSize: 14, fontWeight: 600 }}>{bar.range}</div>
            <div style={{ fontSize: 14, color: '#607d8b' }}>{bar.count}</div>
          </div>
        ))}
      </div>

      {/* Pie Chart */}
      <h2 style={{ marginBottom: 16, color: '#1a237e', fontWeight: 800 }}>Category Pie Chart</h2>
      <div style={{ display: "flex", justifyContent: 'center', alignItems: 'center', minHeight: 300, marginBottom: 32, background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px #eee', padding: 24 }}>
        {pieChart.length === 0 && !loading ? (
          <div style={{ color: '#c62828', fontWeight: 600, fontSize: 18 }}>No category data available for this month.</div>
        ) : (
          <div style={{ width: 340, height: 340 }}>
            <Pie data={pieData} options={{
              plugins: {
                legend: { position: 'bottom', labels: { font: { size: 16 } } },
                tooltip: { enabled: true }
              },
              maintainAspectRatio: false,
              responsive: true
            }} />
          </div>
        )}
      </div>
    </div>
  );
}