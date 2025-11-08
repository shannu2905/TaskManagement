# ⚡ Quick Start Guide

Get the application running in 5 minutes!

## Prerequisites

- Node.js (v18+)
- MongoDB Atlas account (free tier)
- npm or yarn

---

## Step 1: MongoDB Atlas Setup

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) → Create free account
2. Create a cluster (M0 free tier)
3. Create database user (Database Access → Add User)
4. Whitelist IP (Network Access → Add IP Address → Allow from anywhere: `0.0.0.0/0`)
5. Get connection string:
   - Click **Connect** → **Connect your application**
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<database>` with `taskmanagement`

---

## Step 2: Backend Setup

### Terminal 1 - Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
# Windows: copy env.example.txt .env
# Mac/Linux: cp env.example.txt .env

# Edit .env file - Add your MongoDB connection string
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanagement?retryWrites=true&w=majority
# JWT secrets are optional - will be auto-generated if not provided
# For production: npm run generate-secrets

# Seed database (creates test users)
npm run seed

# Start server
npm run dev
```

✅ Backend should be running on `http://localhost:5000`

---

## Step 3: Frontend Setup

### Terminal 2 - Frontend (New Terminal Window)

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
# Windows PowerShell: Copy-Item .env.example .env
# Windows CMD: copy .env.example .env
# Mac/Linux: cp .env.example .env

# .env file should contain:
# VITE_API_URL=http://localhost:5000/api

# Start frontend
npm run dev
```

✅ Frontend should be running on `http://localhost:5173`

---

## Step 4: Access Application

1. Open browser: **http://localhost:5173**
2. You should see the login page

### Test Credentials (after seeding):
- **Owner**: `john@example.com` / `password123`
- **Admin**: `jane@example.com` / `password123`
- **Member**: `bob@example.com` / `password123`

Or create a new account by clicking **Sign up**

---

## 🎯 What to Do Next

1. ✅ **Login** with test credentials
2. ✅ **Create Project** from dashboard
3. ✅ **Open Kanban Board** by clicking on a project
4. ✅ **Create Tasks** using "New Task" button
5. ✅ **Drag & Drop** tasks between columns (To Do → In Progress → Done)
6. ✅ **Assign Tasks** to team members
7. ✅ **Add Comments** on tasks
8. ✅ **View Notifications** (bell icon)

---

## 🔧 Troubleshooting

### Backend won't start
- Check MongoDB connection string in `.env`
- Ensure IP is whitelisted in MongoDB Atlas
- Verify PORT is not in use (change to 5001 if needed)

### Frontend won't connect
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env`
- Verify CORS settings allow `http://localhost:5173`

### Can't install dependencies
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure Node.js version is 18+

---

## 📚 Full Documentation

For detailed instructions, see:
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup guide
- **[README.md](./README.md)** - Full project documentation

---

**Happy coding! 🚀**

