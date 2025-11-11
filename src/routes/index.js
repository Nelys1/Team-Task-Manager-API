const express = require('express');
const auth = require('./auth');
const tasks = require('./tasks');
const projects = require('./projects');
const comments = require('./comments');
const activity = require('./activity');

const router = express.Router();

router.use('/auth', auth);
router.use('/tasks', tasks);
router.use('/projects', projects);
router.use('/comments', comments);
router.use('/activity', activity);

module.exports = router;
