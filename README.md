# Task Management & Team Collaboration Platform

A production-ready full-stack task management application built with the MERN stack, featuring real-time collaboration, drag-and-drop Kanban boards, and role-based access control.

## 🚀 Features

- **User Authentication**: JWT-based authentication with access and refresh tokens
- **Project Management**: Create and manage projects with team members
- **Kanban Board**: Drag-and-drop task management with status lanes (To Do, In Progress, Done)
- **Task Assignment**: Assign tasks to team members with priority levels and due dates
- **Comments**: Real-time commenting on tasks
- **Notifications**: Get notified for task assignments, status changes, comments, and due date reminders
- **Role-Based Access Control**: Owner, Admin, and Member roles with different permissions
- **Real-time Updates**: Socket.IO integration for live collaboration
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- React Router for navigation
- Zustand for state management
- Tailwind CSS for styling
- shadcn/ui components
- @hello-pangea/dnd for drag-and-drop
- React Hook Form + Zod for validation
- Socket.IO Client for real-time updates
- Axios for API calls

### Backend
- Node.js with Express
- MongoDB Atlas (Mongoose)
- JWT authentication (Access + Refresh tokens)
- Socket.IO for real-time features
- Joi for validation
- bcrypt for password hashing
- node-cron for scheduled tasks (due date reminders)

## 📁 Project Structure

```
HACKATHON/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── project.controller.js
│   │   ├── task.controller.js
│   │   └── notification.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Project.model.js
│   │   ├── Task.model.js
│   │   ├── Comment.model.js
│   │   └── Notification.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── project.routes.js
│   │   ├── task.routes.js
│   │   └── notification.routes.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── dueDateChecker.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── project.validator.js
│   │   └── task.validator.js
│   ├── scripts/
│   │   └── seed.js
│   ├── tests/
│   │   ├── auth.test.js
│   │   └── task.test.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ui/
    │   │   │   ├── Button.jsx
    │   │   │   ├── Input.jsx
    │   │   │   ├── Card.jsx
    │   │   │   ├── Avatar.jsx
    │   │   │   ├── Badge.jsx
    │   │   │   └── Modal.jsx
    │   │   ├── Layout.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── ProjectModal.jsx
    │   │   └── TaskModal.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── KanbanBoard.jsx
    │   │   ├── Profile.jsx
    │   │   └── Notifications.jsx
    │   ├── store/
    │   │   ├── authStore.js
    │   │   ├── projectStore.js
    │   │   ├── taskStore.js
    │   │   └── notificationStore.js
    │   ├── lib/
    │   │   ├── api.js
    │   │   └── utils.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

## 🚦 Quick Start

**For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

### Prerequisites

- Node.js (v18 or higher) - [Download](https://nodejs.org/)
- MongoDB Atlas account (free tier) - [Sign up](https://www.mongodb.com/cloud/atlas/register)
- npm or yarn

### Quick Setup (5 minutes)

#### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file (copy from env.example.txt)
# Windows PowerShell: Copy-Item env.example.txt .env
# Windows CMD: copy env.example.txt .env
# Mac/Linux: cp env.example.txt .env

# Edit .env file with your MongoDB Atlas connection string
# JWT secrets are optional - will be auto-generated if not provided
# Then seed database (optional)
npm run seed

# Start backend server
npm run dev
```

Backend runs on `http://localhost:5000`

#### 2. Frontend Setup (New Terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
# Windows PowerShell: Copy-Item .env.example .env
# Windows CMD: copy .env.example .env
# Mac/Linux: cp .env.example .env

# Start frontend server
npm run dev
```

Frontend runs on `http://localhost:5173`

#### 3. Access Application

Open browser: **http://localhost:5173**

**Test Credentials (after seeding):**
- Owner: `john@example.com` / `password123`
- Admin: `jane@example.com` / `password123`
- Member: `bob@example.com` / `password123`

### Environment Variables

**Backend `.env` file:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanagement?retryWrites=true&w=majority
# JWT secrets (optional - auto-generated if not provided)
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

**Note:** JWT secrets are automatically generated if not provided in `.env`. For production, run `npm run generate-secrets` to generate secure secrets.

**Frontend `.env` file:**
```env
VITE_API_URL=http://localhost:5000/api
```

If you deploy your backend to Render (for example at `https://tmtc-backend.onrender.com`), set:
```env
VITE_API_URL=https://tmtc-backend.onrender.com/api
```

## 📝 API Routes

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### Projects
- `GET /api/projects` - Get all projects (user has access to)
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create a new project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks (optionally filtered by projectId)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create a new task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment to task

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/unread/count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read/all` - Mark all as read

## 🎨 UI/UX Features

- **Color Scheme**:
  - Primary: Indigo (#4f46e5)
  - Accent: Orange (#f97316)
  - Soft gray backgrounds
  - Rounded-xl cards with smooth hover transitions

- **Responsive Design**: Mobile-first approach with breakpoints for tablet and desktop

- **Components**: Fully styled with Tailwind CSS and custom shadcn/ui components

## 🔐 Role-Based Access Control

### Owner
- Full control over projects
- Can manage all tasks and members
- Can delete projects

### Admin
- Can manage tasks and members
- Cannot delete projects (owner only)

### Member
- Can create and update assigned tasks only
- Can view all tasks in projects they're members of

## 🧪 Testing

### Backend Tests
Run Jest tests:
```bash
cd backend
npm test
```

### Frontend Tests (Cypress)
```bash
cd frontend
npm run test:e2e
```

## 🔧 Troubleshooting

If you encounter issues:

1. **MongoDB Connection Errors:**
   - Check IP whitelist in MongoDB Atlas
   - Verify connection string format
   - URL-encode special characters in password
   - See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions

2. **Backend/Frontend Issues:**
   - Check error messages in terminal
   - Verify environment variables
   - See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

For detailed troubleshooting, see **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**

## 🚀 Deployment

### Backend (Render/Fly.io)

1. Create a new service on Render or Fly.io
2. Connect your GitHub repository
3. Set environment variables from `.env.example`
4. Deploy

### Frontend (Vercel)

1. Import your repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL` (your backend URL)
5. Deploy

### MongoDB Atlas

1. Create a cluster on MongoDB Atlas
2. Get your connection string
3. Update backend `.env` with `MONGODB_URI`
4. Whitelist your IP addresses or use 0.0.0.0/0 for Render/Fly.io

## 📊 Seed Data

The seed script creates:
- 3 users (owner, admin, member)
- 1 project
- 3 tasks

Login credentials:
- Owner: `john@example.com` / `password123`
- Admin: `jane@example.com` / `password123`
- Member: `bob@example.com` / `password123`

## 🎯 Features in Action

1. **Sign up** → Create a new account
2. **Create Project** → Add a new project from the dashboard
3. **Add Tasks** → Create tasks in the Kanban board
4. **Drag & Drop** → Move tasks between status columns
5. **Assign Tasks** → Assign tasks to team members
6. **Add Comments** → Collaborate with comments
7. **View Notifications** → Get real-time updates

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

Built with ❤️ using the MERN stack

