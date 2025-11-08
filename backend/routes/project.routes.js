import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getMemberProjects,
  getProjectDetails,
  inviteMember,
  removeMember,
} from '../controllers/project.controller.js';
import { getProjectComments, addProjectComment } from '../controllers/projectComment.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getProjects);
router.get('/member/:id', getMemberProjects);
router.get('/:id/details', getProjectDetails);
router.get('/:id', getProject);
router.post('/', createProject);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/invite', inviteMember);
router.delete('/:id/members/:memberId', removeMember);
router.get('/:id/comments', getProjectComments);
router.post('/:id/comments', addProjectComment);

export default router;

