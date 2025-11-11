const ActivityLog = require('../models/ActivityLog');
const Project = require('../models/Project');

/**
 * @swagger
 * /api/activity/logs:
 *   get:
 *     summary: Get activity logs
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string 
 *         required: false
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string 
 *         required: false
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
 *       - in: query
 *         name: sort
 *         schema:  
 *           type: string
 *         required: false
 *     responses:
 *       200:
 *         description: Activity logs retrieved successfully
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
 *                     $ref: '#/components/schemas/ActivityLog'
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
 */
exports.getActivityLogs = async (req, res, next) => {
  try {
    const { projectId, userId, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    let query = {};

    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      if (!project.members.includes(req.user.id) && project.manager.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view activity logs for this project'
        });
      }

      query.project = projectId;
    }

    if (userId) {
      query.user = userId;
    }

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email')
      .populate('project', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ActivityLog.countDocuments(query);

    res.json({
      success: true,
      data: logs,
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
 * /api/projects/{projectId}/activity/logs:
 *   get:
 *     summary: Get activity logs for a project
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
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
 *         description: Activity logs retrieved successfully
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
 *                     $ref: '#/components/schemas/ActivityLog'
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
 */
exports.getProjectActivityLogs = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (!project.members.includes(req.user.id) && project.manager.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view activity logs for this project'
      });
    }

    const logs = await ActivityLog.find({ project: projectId })
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ActivityLog.countDocuments({ project: projectId });

    res.json({
      success: true,
      data: logs,
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
