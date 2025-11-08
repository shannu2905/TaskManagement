import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  listAdmins,
  deleteAdmin,
  getAdminProjectsDetails,
  getOrgStats
} from '../controllers/admin.controller.js';

const router = express.Router();

// List admins - owner or admin
router.get('/', authenticate, authorize('owner', 'admin'), listAdmins);

// Delete admin - owner only
router.delete('/:id', authenticate, authorize('owner'), deleteAdmin);

// Admin's projects and stats - owner or admin
router.get('/:id/projects-details', authenticate, authorize('owner', 'admin'), getAdminProjectsDetails);

// Organization-wide stats for charts - owner or admin
router.get('/stats/org', authenticate, authorize('owner', 'admin'), getOrgStats);

export default router;
