import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getAllUsers, getUserStats } from '../controllers/user.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllUsers);
router.get('/:id/stats', getUserStats);

export default router;

