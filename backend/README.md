# Backend - Task Management API

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file:

```bash
# Windows
copy env.example.txt .env

# Mac/Linux
cp env.example.txt .env
```

### 3. Configure Environment Variables

**Minimum required:**
```env
MONGODB_URI=your-mongodb-connection-string
```

**JWT Secrets (Optional):**
- JWT secrets are **automatically generated** if not provided
- For development: Leave empty (auto-generated)
- For production: Run `npm run generate-secrets` to generate secure secrets

### 4. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## 📝 Environment Variables

### Required
- `MONGODB_URI` - MongoDB Atlas connection string

### Optional (Auto-generated if not provided)
- `JWT_ACCESS_SECRET` - JWT access token secret (auto-generated)
- `JWT_REFRESH_SECRET` - JWT refresh token secret (auto-generated)

### Optional (Defaults provided)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (default: development)
- `JWT_ACCESS_EXPIRES_IN` - Access token expiry (default: 15m)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiry (default: 7d)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)

## 🔐 Generate JWT Secrets

For production, generate secure secrets:

```bash
npm run generate-secrets
```

This will:
- Generate secure random secrets (64 bytes)
- Update your `.env` file automatically
- Display the secrets in the console

## 🌱 Seed Database

Create sample users and projects:

```bash
npm run seed
```

**Test Credentials:**
- Owner: `john@example.com` / `password123`
- Admin: `jane@example.com` / `password123`
- Member: `bob@example.com` / `password123`

## 🧪 Testing

```bash
npm test
```

## 📚 API Documentation

See main [README.md](../README.md) for API routes and documentation.

