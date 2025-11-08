import express from 'express';
import { signup, login, refresh, me } from '../controllers/auth.controller.js';
import { googleAuth, googleCallback, githubAuth, githubCallback } from '../controllers/auth.oauth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);

router.get('/me', authenticate, me);

// OAuth
router.get('/oauth/google', googleAuth);
router.get('/oauth/google/callback', googleCallback);
router.get('/oauth/github', githubAuth);
router.get('/oauth/github/callback', githubCallback);

export default router;

