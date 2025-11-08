import User from '../models/User.model.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import bcrypt from 'bcryptjs';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Helper to build backend redirect_uri from request to avoid mismatches with provider config
const buildRedirectUri = (req, path) => {
  // Prefer BACKEND_URL if set (useful in production), otherwise derive from incoming request
  if (process.env.BACKEND_URL) return `${process.env.BACKEND_URL.replace(/\/$/, '')}${path}`;
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.get('host');
  return `${proto}://${host}${path}`;
};

// Redirect to Google OAuth consent
export const googleAuth = async (req, res, next) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('[OAuth] Missing GOOGLE_CLIENT_ID');
      return res.status(500).json({ message: 'Server misconfiguration: GOOGLE_CLIENT_ID is not set' });
    }

    const redirectUri = buildRedirectUri(req, '/api/auth/oauth/google/callback');
    const scope = encodeURIComponent('profile email');
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

    console.log('[OAuth] Redirecting to Google auth URL. client_id present, redirect_uri=', redirectUri);
    res.redirect(url);
  } catch (err) { next(err); }
};

export const googleCallback = async (req, res, next) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send('Missing code');

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      console.error('[OAuth] Missing GOOGLE_CLIENT_ID/SECRET');
      return res.status(500).json({ message: 'Server misconfiguration: GOOGLE client credentials are not set' });
    }

    const redirectUri = buildRedirectUri(req, '/api/auth/oauth/google/callback');

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' })
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      console.error('[OAuth] Google token exchange error:', tokenData);
      return res.status(400).json({ message: 'Google token exchange failed', details: tokenData });
    }

    const accessToken = tokenData.access_token;
    if (!accessToken) return res.status(400).send('Failed to obtain access token');

    // Fetch user info
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const profile = await profileRes.json();
    const email = profile.email;
    const name = profile.name || profile.given_name || (email ? email.split('@')[0] : 'Google User');

    let user = await User.findOne({ email });
    if (!user) {
      const randomPw = Math.random().toString(36).slice(-12);
      const pwHash = await bcrypt.hash(randomPw, 10);
      user = await User.create({ name, email, passwordHash: pwHash, role: 'member' });
    }

    const at = generateAccessToken(user._id);
    const rt = generateRefreshToken(user._id);

    // Redirect back to frontend with tokens in query (SPA should pick them up)
    const redirect = `${FRONTEND_URL}/oauth/callback?accessToken=${encodeURIComponent(at)}&refreshToken=${encodeURIComponent(rt)}`;
    res.redirect(redirect);
  } catch (err) { next(err); }
};

// GitHub OAuth
export const githubAuth = async (req, res, next) => {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      console.error('[OAuth] Missing GITHUB_CLIENT_ID');
      return res.status(500).json({ message: 'Server misconfiguration: GITHUB_CLIENT_ID is not set' });
    }
    const redirectUri = buildRedirectUri(req, '/api/auth/oauth/github/callback');
    const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user user:email`;
    console.log('[OAuth] Redirecting to GitHub auth URL, redirect_uri=', redirectUri);
    res.redirect(url);
  } catch (err) { next(err); }
};

export const githubCallback = async (req, res, next) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send('Missing code');

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      console.error('[OAuth] Missing GITHUB client credentials');
      return res.status(500).json({ message: 'Server misconfiguration: GITHUB client credentials are not set' });
    }

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      console.error('[OAuth] GitHub token exchange error:', tokenData);
      return res.status(400).json({ message: 'GitHub token exchange failed', details: tokenData });
    }
    const accessToken = tokenData.access_token;
    if (!accessToken) return res.status(400).send('Failed to obtain access token from GitHub');

    // Get user profile
    const profileRes = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github.v3+json' } });
    const profile = await profileRes.json();

    // Get primary email
    let email = profile.email;
    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github.v3+json' } });
      const emails = await emailsRes.json();
      const primary = (emails || []).find(e => e.primary) || emails[0];
      email = primary?.email;
    }

    const name = profile.name || profile.login || (email ? email.split('@')[0] : 'GitHub User');

    let user = await User.findOne({ email });
    if (!user) {
      const randomPw = Math.random().toString(36).slice(-12);
      const pwHash = await bcrypt.hash(randomPw, 10);
      user = await User.create({ name, email, passwordHash: pwHash, role: 'member' });
    }

    const at = generateAccessToken(user._id);
    const rt = generateRefreshToken(user._id);

    const redirect = `${FRONTEND_URL}/oauth/callback?accessToken=${encodeURIComponent(at)}&refreshToken=${encodeURIComponent(rt)}`;
    res.redirect(redirect);
  } catch (err) { next(err); }
};
