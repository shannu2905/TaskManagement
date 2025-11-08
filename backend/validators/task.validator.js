import Joi from 'joi';

export const createTaskSchema = Joi.object({
  projectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
    .messages({
      'string.pattern.base': 'Invalid project ID format'
    }),
  title: Joi.string().trim().max(200).required()
    .messages({
      'string.empty': 'Task title is required',
      'string.max': 'Title cannot exceed 200 characters'
    }),
  desc: Joi.string().trim().max(1000).allow('').optional(),
  assignee: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).optional(),
  status: Joi.string().valid('todo', 'in_progress', 'done').optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  dueDate: Joi.date().allow(null).optional()
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().trim().max(200).optional(),
  desc: Joi.string().trim().max(1000).allow('').optional(),
  assignee: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).optional(),
  status: Joi.string().valid('todo', 'in_progress', 'done').optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  dueDate: Joi.date().allow(null).optional()
});

export const createCommentSchema = Joi.object({
  text: Joi.string().trim().max(500).required()
    .messages({
      'string.empty': 'Comment text is required',
      'string.max': 'Comment cannot exceed 500 characters'
    })
});

