# Vercel Deployment Guide

This guide explains how to deploy both frontend and backend to Vercel.

## Project Structure

- **Frontend**: `frontend/` - React + Vite app
- **Backend API**: `api/` - Vercel serverless functions
- **Legacy Backend**: `backend/` - Express server (not used in Vercel deployment)

## Deployment Steps

### 1. Push to GitHub

Make sure your code is pushed to GitHub:

```bash
git add .
git commit -m "Add Vercel serverless API functions"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (click Edit and set to `frontend`)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### 3. Add Environment Variables

Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

#### Frontend Variables:
```
VITE_SUPABASE_URL = your_supabase_project_url
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
VITE_BACKEND_URL = https://your-project.vercel.app
VITE_ADMIN_PASSWORD = your_admin_password
```

#### Backend API Variables:
```
SUPABASE_URL = your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY = your_supabase_service_role_key
SMTP_EMAIL = your_gmail@gmail.com
SMTP_PASS = your_gmail_app_password
NODE_ENV = production
```

**Important**: 
- Set `VITE_BACKEND_URL` to your Vercel deployment URL (e.g., `https://kiosk-quiz.vercel.app`)
- This allows the frontend to call the API functions on the same domain

### 4. Deploy

Click "Deploy" and wait for the build to complete.

## API Endpoints

After deployment, your API will be available at:

- `https://your-project.vercel.app/api/health` - Health check
- `https://your-project.vercel.app/api/auth/send-otp` - Send OTP
- `https://your-project.vercel.app/api/auth/verify-otp` - Verify OTP
- `https://your-project.vercel.app/api/stats` - Get statistics
- `https://your-project.vercel.app/api/export` - Export CSV

## How It Works

1. **Frontend**: Deployed as static files from `frontend/dist`
2. **Backend**: Deployed as serverless functions in `api/` folder
3. **Same Domain**: Both frontend and API are on the same Vercel domain
4. **Automatic Routing**: Vercel automatically routes `/api/*` to serverless functions

## Important Notes

### OTP Storage
- The OTP store is in-memory and won't persist across serverless invocations
- This works fine for short-term storage (5 minutes)
- For production with high traffic, consider using Supabase or Redis

### Daily Export
- The daily export scheduler from the Express backend is not included
- You can create a Vercel Cron Job if needed
- Or use Supabase Edge Functions for scheduled tasks

### CORS
- CORS is handled in each API function
- All origins are allowed (`*`) - adjust for production if needed

## Troubleshooting

### Build Fails
- Check that all dependencies are in root `package.json`
- Verify environment variables are set
- Check build logs in Vercel Dashboard

### API Not Working
- Verify `VITE_BACKEND_URL` is set to your Vercel URL
- Check API function logs in Vercel Dashboard
- Ensure environment variables are set for API functions

### Email Not Sending
- Verify `SMTP_EMAIL` and `SMTP_PASS` are correct
- Check Gmail app password is valid
- Review function logs for email errors

## Benefits of Vercel Deployment

✅ **Single Platform**: Frontend and backend on one platform
✅ **Automatic Deployments**: Every GitHub push triggers deployment
✅ **Serverless**: No server management needed
✅ **Free Tier**: Generous free tier for small projects
✅ **Global CDN**: Fast loading times worldwide
✅ **Preview Deployments**: Test changes before production

## Next Steps

1. Deploy to Vercel
2. Test all API endpoints
3. Update `VITE_BACKEND_URL` to your Vercel URL
4. Test full application flow
5. (Optional) Add custom domain
6. (Optional) Set up Vercel Cron Jobs for scheduled tasks

