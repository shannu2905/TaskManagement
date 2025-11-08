# Debugging Blank Page Issue

If you're seeing a blank page, follow these steps:

## Step 1: Check Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Look for any red error messages
4. Share the error messages you see

## Step 2: Check Network Tab

1. In Developer Tools, go to the **Network** tab
2. Refresh the page (F5)
3. Check if any files are failing to load (red status codes)
4. Look for:
   - `main.jsx` should load successfully
   - `index.css` should load successfully
   - Any API calls should show their status

## Step 3: Verify Backend is Running

Make sure the backend server is running:
```powershell
cd backend
npm run dev
```

You should see: `Server running on port 5000`

## Step 4: Check Routes

Try accessing these URLs directly:
- `http://localhost:5173/login` - Should show login page
- `http://localhost:5173/signup` - Should show signup page
- `http://localhost:5173/` - Should redirect to login if not authenticated

## Step 5: Clear Browser Cache

1. Press `Ctrl + Shift + Delete`
2. Clear cached images and files
3. Refresh the page with `Ctrl + F5` (hard refresh)

## Step 6: Check localStorage

1. Open Developer Tools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Open **Local Storage** → `http://localhost:5173`
4. Check if there are any items stored
5. Try clearing them and refreshing

## Common Issues

### Issue: "Cannot GET /"
- This means Vite is not running
- Solution: Start the frontend server with `npm run dev`

### Issue: "Failed to fetch" or "Network Error"
- Backend server is not running
- Solution: Start the backend server with `npm run dev` in the backend directory

### Issue: "Module not found"
- Dependencies not installed
- Solution: Run `npm install` in the frontend directory

### Issue: Blank page with no errors
- Check if React is rendering at all
- Open browser console and type: `document.getElementById('root')`
- Should return the root element, not null

## Quick Fixes

1. **Restart both servers:**
   ```powershell
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Clear and reinstall dependencies:**
   ```powershell
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check if port 5173 is in use:**
   ```powershell
   netstat -ano | findstr :5173
   ```

If you find any errors in the console, please share them!

