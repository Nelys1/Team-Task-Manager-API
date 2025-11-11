const express = require('express');
const {
  getActivityLogs,
  getProjectActivityLogs
} = require('../controllers/activityController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.get('/', getActivityLogs);
router.get('/project/:projectId', getProjectActivityLogs);

module.exports = router;
