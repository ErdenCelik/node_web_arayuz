const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.use((req, res, next) => {
  bootstrap.init();
  bootstrap.initDefault();
  next();
});

router.get('/', dashboardController.showDashboard);
router.get('/chart', dashboardController.showDashboardDataAPI);

module.exports = router;
