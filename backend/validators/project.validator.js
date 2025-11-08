import Joi from 'joi';

export const createProjectSchema = Joi.object({
  title: Joi.string().trim().max(100).required()
    .messages({
      'string.empty': 'Project title is required',
      'string.max': 'Title cannot exceed 100 characters'
    }),
  description: Joi.string().trim().max(500).allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    })
});

export const updateProjectSchema = Joi.object({
  title: Joi.string().trim().max(100).optional(),
  description: Joi.string().trim().max(500).allow('').optional(),
  members: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).optional()
});

