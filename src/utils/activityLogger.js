const ActivityLog = require('../models/ActivityLog');

const logActivity = async (data) => {
  try {
    await ActivityLog.create(data);
  } catch (error) {
    console.error('Activity logging failed:', error);
  }
};

module.exports = { logActivity };
