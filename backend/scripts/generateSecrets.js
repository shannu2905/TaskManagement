import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate secure random JWT secrets
 */
const generateSecrets = () => {
  const accessSecret = crypto.randomBytes(64).toString('hex');
  const refreshSecret = crypto.randomBytes(64).toString('hex');

  console.log('\n🔐 Generated JWT Secrets:\n');
  console.log('JWT_ACCESS_SECRET=' + accessSecret);
  console.log('JWT_REFRESH_SECRET=' + refreshSecret);
  console.log('\n📝 Copy these to your .env file\n');

  // Try to update .env file if it exists
  const envPath = path.join(__dirname, '..', '.env');
  
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update or add JWT_ACCESS_SECRET
    if (envContent.includes('JWT_ACCESS_SECRET=')) {
      envContent = envContent.replace(
        /JWT_ACCESS_SECRET=.*/,
        `JWT_ACCESS_SECRET=${accessSecret}`
      );
    } else {
      envContent += `\nJWT_ACCESS_SECRET=${accessSecret}\n`;
    }

    // Update or add JWT_REFRESH_SECRET
    if (envContent.includes('JWT_REFRESH_SECRET=')) {
      envContent = envContent.replace(
        /JWT_REFRESH_SECRET=.*/,
        `JWT_REFRESH_SECRET=${refreshSecret}`
      );
    } else {
      envContent += `JWT_REFRESH_SECRET=${refreshSecret}\n`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated .env file with generated secrets\n');
  } else {
    console.log('⚠️  .env file not found. Create it and add the secrets above.\n');
  }

  return { accessSecret, refreshSecret };
};

generateSecrets();

