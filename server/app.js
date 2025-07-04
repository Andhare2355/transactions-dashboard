const express = require('express');
const app = express();
const cors = require('cors');
const transactionRoutes = require('./routes/transactionRoutes');
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use('/api', transactionRoutes);

module.exports = app;
