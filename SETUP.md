# UPI Quiz Kiosk - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Supabase Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create a new project
   - Note your project URL and API keys

2. **Run Database Migration**
   - Open Supabase Dashboard > SQL Editor
   - Copy and paste contents of `supabase-migration.sql`
   - Execute the SQL script

3. **Configure Email Provider**
   - Go to Authentication > Providers
   - Enable Email provider
   - Configure SMTP settings (or use Supabase default)
   - Set email template if needed

4. **Get API Keys**
   - Go to Settings > API
   - Copy:
     - Project URL → `VITE_SUPABASE_URL` and `SUPABASE_URL`
     - `anon` key → `VITE_SUPABASE_ANON_KEY`
     - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 3. Environment Variables

Create `.env` file in root directory:

```env
# Frontend (Public)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ADMIN_PASSWORD=UPI_ADMIN_2024

# Backend (Private - Never commit!)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
PORT=5000
```

### 4. Run Development Server

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### 5. Build for Production

```bash
npm run build
```

Serve `frontend/dist/` with any static file server.

## Kiosk Mode Setup

### iPad (iOS)

1. **Install Chrome** (or use Safari)
2. **Open your app URL**
3. **Enable Guided Access**:
   - Settings > Accessibility > Guided Access
   - Enable Guided Access
   - Triple-click home button
   - Draw around the browser area
   - Tap Start

### Chrome Desktop/TV Kiosk Mode

**Windows:**
```batch
start chrome.exe --kiosk --fullscreen http://localhost:3000
```

**macOS:**
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --kiosk --fullscreen http://localhost:3000
```

**Linux:**
```bash
google-chrome --kiosk --fullscreen http://localhost:3000
```

### Production Deployment

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Serve with a web server:**
   - Use nginx, Apache, or any static file server
   - Point to `frontend/dist/` directory
   - Configure CORS if needed

3. **Run backend:**
   ```bash
   cd backend
   npm start
   ```

4. **Set up auto-start (optional):**
   - Use PM2: `pm2 start backend/server.js`
   - Configure systemd service (Linux)
   - Use Task Scheduler (Windows)

## Admin Panel Access

1. Navigate to `/admin` route
2. Enter admin password (default: `UPI_ADMIN_2024`)
3. View statistics and export CSV

## Troubleshooting

### OTP Not Sending

- Check Supabase email provider settings
- Verify SMTP configuration
- Check Supabase logs for errors
- Ensure email is not blocked by spam filters

### Database Errors

- Verify `game_sessions` table exists
- Check RLS policies are correct
- Ensure API keys are correct
- Check Supabase project is active

### Virtual Keyboard Not Appearing

- Ensure inputs are focused
- Check browser console for errors
- Verify Tailwind CSS is loaded
- Test on touch device

### Game Not Starting

- Check browser console for errors
- Verify Supabase session is created
- Check database for user entry
- Ensure OTP verification completed

## Security Checklist

- [ ] Change default admin password
- [ ] Use HTTPS in production
- [ ] Keep `.env` file secure (never commit)
- [ ] Enable Supabase RLS policies
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Regular backups of database

## Support

For issues or questions, check:
- Supabase Documentation: https://supabase.com/docs
- React Documentation: https://react.dev
- Vite Documentation: https://vitejs.dev

