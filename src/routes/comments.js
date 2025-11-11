const express = require('express');
const {
  getTaskComments,
  createComment,
  updateComment,
  deleteComment
} = require('../controllers/commentController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.get('/task/:taskId', getTaskComments);
router.post('/', createComment);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

module.exports = router;
