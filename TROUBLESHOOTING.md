# 🔧 Troubleshooting Guide

Common issues and solutions for the Task Management Platform.

## MongoDB Connection Issues

### Error: "SSL/TLS Alert Internal Error" or "PoolClearedError"

This is a common MongoDB Atlas connection issue. Here are solutions:

#### Solution 1: Check IP Whitelist

1. Go to MongoDB Atlas → **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0) for development
   - Or add your specific IP address
4. Wait 1-2 minutes for changes to propagate
5. Try connecting again

#### Solution 2: Verify Connection String

1. Check your `.env` file has correct `MONGODB_URI`
2. Ensure password is **URL-encoded** if it contains special characters:
   - `@` → `%40`
   - `#` → `%23`
   - `%` → `%25`
   - `&` → `%26`
   - etc.

**Example:**
```env
# If password is: myP@ss#123
# Connection string should be:
MONGODB_URI=mongodb+srv://username:myP%40ss%23123@cluster.mongodb.net/dbname
```

#### Solution 3: Update Dependencies

```bash
cd backend
npm update mongoose
npm install
```

#### Solution 4: Check Connection String Format

Ensure your connection string follows this format:

```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Common issues:**
- Missing `mongodb+srv://` prefix
- Incorrect password encoding
- Missing database name
- Extra spaces or quotes

#### Solution 5: Test Connection Directly

Test your connection string:

```bash
# In backend directory
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => { console.log('Connected!'); process.exit(0); }).catch(err => { console.error('Error:', err.message); process.exit(1); });"
```

### Error: "Authentication Failed"

**Solutions:**
1. Verify database username and password in MongoDB Atlas
2. Check password encoding in connection string
3. Ensure database user has proper permissions
4. Try creating a new database user

### Error: "Connection Timeout"

**Solutions:**
1. Check IP whitelist in MongoDB Atlas
2. Verify internet connection
3. Check firewall settings
4. Ensure MongoDB Atlas cluster is running
5. Try from a different network

## Backend Issues

### Port Already in Use

**Error:** `Port 5000 already in use`

**Solution:**
```bash
# Change PORT in .env file
PORT=5001
```

Or kill the process using port 5000:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Module Not Found

**Error:** `Cannot find module 'xyz'`

**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### JWT Secret Errors

**Error:** JWT secret not found

**Solution:**
- JWT secrets are auto-generated if not provided
- For production, run: `npm run generate-secrets`
- Check `.env` file exists and is properly formatted

## Frontend Issues

### Cannot Connect to API

**Error:** `Network Error` or `Cannot connect to localhost:5000`

**Solutions:**
1. Ensure backend server is running on port 5000
2. Check `VITE_API_URL` in frontend `.env` file
3. Verify CORS settings in backend allow `http://localhost:5173`
4. Check browser console for detailed error

### Port 5173 Already in Use

**Solution:**
Vite will automatically use the next available port, or:

```bash
# Kill process using port 5173
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5173 | xargs kill -9
```

### Build Errors

**Error:** `Build failed`

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

## Database Issues

### Seed Script Fails

**Error:** `Error seeding data`

**Solutions:**
1. Check MongoDB connection (see above)
2. Ensure database is accessible
3. Try running seed script again
4. Check if data already exists (script clears existing data)

### Cannot Connect to MongoDB Atlas

**Checklist:**
- [ ] MongoDB Atlas account is active
- [ ] Cluster is created and running
- [ ] Database user exists
- [ ] IP address is whitelisted
- [ ] Connection string is correct
- [ ] Password is URL-encoded
- [ ] Database name is correct

## Authentication Issues

### Login Fails

**Solutions:**
1. Check if user exists (run seed script)
2. Verify password is correct
3. Check backend server is running
4. Verify JWT secrets are set
5. Check browser console for errors

### Token Expired

**Solution:**
- Tokens expire after 15 minutes (access) or 7 days (refresh)
- App should automatically refresh tokens
- If issues persist, logout and login again

## General Issues

### Dependencies Installation Fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading

**Check:**
1. `.env` file exists in correct directory
2. No spaces around `=` sign
3. No quotes around values (unless needed)
4. File is saved and not corrupted

**Example:**
```env
# ✅ Correct
MONGODB_URI=mongodb+srv://...
PORT=5000

# ❌ Wrong
MONGODB_URI = mongodb+srv://...
PORT="5000"
```

### Still Having Issues?

1. **Check logs:**
   - Backend: Check terminal where `npm run dev` is running
   - Frontend: Check browser console (F12)

2. **Verify setup:**
   - Follow [SETUP_GUIDE.md](./SETUP_GUIDE.md) step by step
   - Ensure all prerequisites are installed

3. **Common mistakes:**
   - Forgetting to start backend server
   - Wrong connection string format
   - IP not whitelisted in MongoDB Atlas
   - Missing environment variables

4. **Get help:**
   - Check error messages carefully
   - Search for specific error online
   - Review MongoDB Atlas documentation

## Quick Fixes

### Reset Everything

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
# Update .env with correct MONGODB_URI
npm run dev

# Frontend (new terminal)
cd frontend
rm -rf node_modules package-lock.json dist
npm install
npm run dev
```

### Verify Installation

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Check MongoDB connection
# In backend directory
node -e "require('dotenv').config(); console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Missing');"
```

---

**Need more help?** Check the main [README.md](./README.md) or [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

