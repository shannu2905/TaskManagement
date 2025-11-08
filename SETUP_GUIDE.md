# 🚀 Quick Start Guide - Task Management Platform

Follow these steps to get the application up and running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB Atlas account** (free tier available) - [Sign up here](https://www.mongodb.com/cloud/atlas/register)
- **Git** (optional, for version control)

## Step 1: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Create a new cluster (choose the free M0 tier)
3. Wait for the cluster to be created (takes 3-5 minutes)
4. Go to **Database Access** → **Add New Database User**
   - Create a username and password (save these!)
   - Set privileges to "Atlas Admin"
5. Go to **Network Access** → **Add IP Address**
   - Click "Allow Access from Anywhere" (or add your IP address)
6. Go to **Database** → Click **Connect** on your cluster
7. Choose **Connect your application**
8. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/...`)
9. Replace `<password>` with your database user password
10. Replace `<database>` with `taskmanagement` (or keep default)

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Install Dependencies

```bash
npm install
```

This will install all required packages (Express, Mongoose, JWT, Socket.IO, etc.)

### 2.3 Create Environment File

Create a `.env` file in the `backend` directory:

**Windows (PowerShell):**
```powershell
Copy-Item env.example.txt .env
```

**Windows (CMD):**
```cmd
copy env.example.txt .env
```

**Mac/Linux:**
```bash
cp env.example.txt .env
```

**Note:** If `.env.example` doesn't exist, you can create `.env` manually with the content shown above.

### 2.4 Configure Environment Variables

Open the `.env` file and update the following values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas - Replace with your connection string from Step 1
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/taskmanagement?retryWrites=true&w=majority

# JWT Secrets (Optional - auto-generated if not provided)
# For production: Run 'npm run generate-secrets' to generate secure secrets
# Or leave empty for automatic generation (development only)
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Important:** 
- Replace `yourusername` and `yourpassword` in MONGODB_URI with your MongoDB Atlas credentials
- **URL-encode special characters** in password:
  - `@` → `%40`
  - `#` → `%23`
  - `%` → `%25`
  - `&` → `%26`
- **JWT secrets are auto-generated** if not provided (for development)
- For production, run `npm run generate-secrets` to generate secure secrets
- Keep these secrets secure and never commit them to version control

**Troubleshooting:** If you encounter SSL/TLS errors, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### 2.5 Generate JWT Secrets (Optional - for production)

For production environments, generate secure JWT secrets:

```bash
npm run generate-secrets
```

This will generate secure random secrets and update your `.env` file automatically.

**Note:** For development, JWT secrets are auto-generated if not provided in `.env`.

### 2.6 Seed the Database (Optional but Recommended)

This creates sample users and projects for testing:

```bash
npm run seed
```

You should see output like:
```
✅ Seed data created successfully!

Login credentials:
Owner: john@example.com / password123
Admin: jane@example.com / password123
Member: bob@example.com / password123
```

### 2.7 Start the Backend Server

```bash
npm run dev
```

You should see:
```
MongoDB Connected: cluster0.xxxxx.mongodb.net
Server running on port 5000
```

**Keep this terminal window open!** The backend server must be running.

## Step 3: Frontend Setup

Open a **new terminal window** (keep the backend running in the first terminal).

### 3.1 Navigate to Frontend Directory

```bash
cd frontend
```

### 3.2 Install Dependencies

```bash
npm install
```

This will install all required packages (React, Vite, Tailwind, etc.)

### 3.3 Create Environment File

Create a `.env` file in the `frontend` directory:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Windows (CMD):**
```cmd
copy .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

### 3.4 Configure Environment Variables

Open the `.env` file and ensure it contains:

```env
VITE_API_URL=http://localhost:5000/api
```

This tells the frontend where to find the backend API.

### 3.5 Start the Frontend Development Server

```bash
npm run dev
```

You should see output like:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Keep this terminal window open too!**

## Step 4: Access the Application

1. Open your web browser
2. Navigate to: **http://localhost:5173**
3. You should see the login page

## Step 5: Test the Application

### Option A: Use Seed Data (Recommended for First Time)

If you ran the seed script, you can login with:

- **Owner Account:**
  - Email: `john@example.com`
  - Password: `password123`

- **Admin Account:**
  - Email: `jane@example.com`
  - Password: `password123`

- **Member Account:**
  - Email: `bob@example.com`
  - Password: `password123`

### Option B: Create New Account

1. Click **Sign up** on the login page
2. Fill in:
   - Name: Your name
   - Email: Your email
   - Password: At least 6 characters
3. Click **Sign up**
4. You'll be automatically logged in and redirected to the dashboard

## Step 6: Explore the Features

1. **Dashboard**: View all your projects
2. **Create Project**: Click "New Project" button
3. **Kanban Board**: Click on any project to open the Kanban board
4. **Create Tasks**: Click "New Task" on the Kanban board
5. **Drag & Drop**: Move tasks between columns (To Do → In Progress → Done)
6. **Edit Tasks**: Click on any task to edit details, assign users, add comments
7. **Notifications**: Click the bell icon to see notifications
8. **Profile**: Click your name to update your profile

## Troubleshooting

### Backend Issues

**Problem: "MongoDB connection failed"**
- Check your MONGODB_URI in `.env` file
- Ensure your MongoDB Atlas IP whitelist includes your IP (or 0.0.0.0/0)
- Verify your database username and password are correct

**Problem: "Port 5000 already in use"**
- Change PORT in `.env` to a different number (e.g., 5001)
- Or stop the process using port 5000

**Problem: "Cannot find module"**
- Run `npm install` again in the backend directory
- Delete `node_modules` folder and `package-lock.json`, then run `npm install`

### Frontend Issues

**Problem: "Cannot connect to API"**
- Ensure backend server is running on port 5000
- Check `VITE_API_URL` in frontend `.env` file
- Verify CORS settings in backend allow `http://localhost:5173`

**Problem: "Port 5173 already in use"**
- Vite will automatically use the next available port
- Or stop the process using port 5173

**Problem: "Module not found"**
- Run `npm install` again in the frontend directory
- Delete `node_modules` folder and `package-lock.json`, then run `npm install`

### Database Issues

**Problem: "Seed script fails"**
- Ensure MongoDB connection is working
- Check that you can connect to MongoDB Atlas
- Try running the seed script again

## Development Commands

### Backend Commands

```bash
# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Run tests
npm test

# Seed database
npm run seed
```

### Frontend Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
HACKATHON/
├── backend/          # Node.js + Express API
│   ├── .env         # Environment variables (create this)
│   └── ...
└── frontend/         # React + Vite app
    ├── .env          # Environment variables (create this)
    └── ...
```

## Next Steps

- ✅ Both servers are running
- ✅ You can login and create projects
- ✅ You can create tasks and use the Kanban board
- ✅ Real-time updates work via Socket.IO

**Happy coding! 🎉**

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Socket.IO Documentation](https://socket.io/docs/)

