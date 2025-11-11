const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { validateComment } = require('../middlewares/validation');
const { logActivity } = require('../utils/activityLogger');

/**
 * @swagger
 * /api/tasks/{taskId}/comments:
 *   get:
 *     summary: Get comments for a task
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         required: false
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         required: false
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:  
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items: 
 *                     $ref: '#/components/schemas/Comment'
 *                 pagination:
 *                   type: object 
 *                   properties:
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     total:
 *                       type: number
 *                     pages:
 *                       type: number 
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 *       403:
 *         description: Not authorized to access comments for this task
 */
exports.getTaskComments = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const task = await Task.findById(taskId).populate('project');
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (!task.project.members.includes(req.user.id) && task.project.manager.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access comments for this task'
      });
    }

    const comments = await Comment.find({ task: taskId })
      .populate('user', 'name email avatar')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments({ task: taskId });

    res.json({
      success: true,
      data: comments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/tasks/{taskId}/comments:
 *   post:
 *     summary: Create a comment for a task
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:  
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 *       403:
 *         description: Not authorized to comment on this task
 */
exports.createComment = async (req, res, next) => {
  try {
    const { error } = validateComment(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const task = await Task.findById(req.body.task).populate('project');
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (!task.project.members.includes(req.user.id) && task.project.manager.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to comment on this task'
      });
    }

    const comment = await Comment.create({
      ...req.body,
      user: req.user.id
    });

    await comment.populate('user', 'name email avatar');

    await logActivity({
      action: 'comment',
      entityType: 'comment',
      entityId: comment._id,
      description: `Added comment to task "${task.title}"`,
      user: req.user.id,
      project: task.project._id
    });

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:  
 *               type: object 
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 *       403:
 *         description: Not authorized to update this comment
 */
exports.updateComment = async (req, res, next) => {
  try {
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('user', 'name email avatar');

    const task = await Task.findById(comment.task).populate('project');

    await logActivity({
      action: 'update',
      entityType: 'comment',
      entityId: comment._id,
      description: `Updated comment on task "${task.title}"`,
      user: req.user.id,
      project: task.project._id
    });

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:  
 *               type: object 
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string 
 *                     name:
 *                       type: string 
 *                     email:
 *                       type: string 
 *                     role:
 *                       type: string 
 *       404:
 *         description: Comment not found
 *       403:
 *         description: Not authorized to delete this comment
 */
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    const task = await Task.findById(comment.task).populate('project');

    await Comment.findByIdAndDelete(req.params.id);

    await logActivity({
      action: 'delete',
      entityType: 'comment',
      entityId: comment._id,
      description: `Deleted comment on task "${task.title}"`,
      user: req.user.id,
      project: task.project._id
    });

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
