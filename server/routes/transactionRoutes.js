const express = require('express');
const router = express.Router();
const {
  listTransactions,
  getStatistics,
  getBarChart,
  getPieChart,
  getCombinedData,
  initData,
  fetchExternal
} = require('../controllers/transactionController');

router.get('/init', initData);
router.get('/transactions', listTransactions);
router.get('/statistics', getStatistics);
router.get('/barchart', getBarChart);
router.get('/piechart', getPieChart);
router.get('/combined', getCombinedData);
router.get('/external', fetchExternal);

module.exports = router;
