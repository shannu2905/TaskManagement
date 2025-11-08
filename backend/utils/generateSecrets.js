import crypto from 'crypto';

/**
 * Generate a secure random secret string
 * @param {number} length - Length of the secret (default: 64)
 * @returns {string} Random secret string
 */
export const generateSecret = (length = 64) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate JWT secrets if not provided in environment
 * This is useful for development. For production, use strong secrets in .env
 */
export const ensureSecrets = () => {
  if (!process.env.JWT_ACCESS_SECRET) {
    const accessSecret = generateSecret(64);
    process.env.JWT_ACCESS_SECRET = accessSecret;
    console.log('⚠️  JWT_ACCESS_SECRET not found in .env - Generated automatically');
    console.log('⚠️  For production, set JWT_ACCESS_SECRET in .env file');
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    const refreshSecret = generateSecret(64);
    process.env.JWT_REFRESH_SECRET = refreshSecret;
    console.log('⚠️  JWT_REFRESH_SECRET not found in .env - Generated automatically');
    console.log('⚠️  For production, set JWT_REFRESH_SECRET in .env file');
  }

  return {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
  };
};

