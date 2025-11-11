const Joi = require('joi');

exports.validateUserRegistration = (data) => {
  const schema = Joi.object({
    name: Joi.string().max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('user', 'manager', 'admin')
  });
  return schema.validate(data);
};

exports.validateTask = (data) => {
  const schema = Joi.object({
    title: Joi.string().max(200).required(),
    description: Joi.string().max(1000),
    project: Joi.string().required(),
    assignedTo: Joi.string(),
    status: Joi.string().valid('todo', 'in-progress', 'review', 'completed'),
    priority: Joi.string().valid('low', 'medium', 'high', 'critical'),
    dueDate: Joi.date(),
    tags: Joi.array().items(Joi.string()),
    estimatedHours: Joi.number().min(0)
  });
  return schema.validate(data);
};

exports.validateProject = (data) => {
  const schema = Joi.object({
    name: Joi.string().max(100).required(),
    description: Joi.string().max(500),
    members: Joi.array().items(Joi.string()),
    status: Joi.string().valid('active', 'completed', 'on-hold', 'cancelled'),
    startDate: Joi.date(),
    endDate: Joi.date(),
    color: Joi.string()
  });
  return schema.validate(data);
};

exports.validateComment = (data) => {
  const schema = Joi.object({
    content: Joi.string().max(1000).required(),
    task: Joi.string().required(),
    attachments: Joi.array().items(Joi.object({
      filename: Joi.string(),
      url: Joi.string(),
      mimetype: Joi.string()
    }))
  });
  return schema.validate(data);
};
