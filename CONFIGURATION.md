# Configuration Guide

## ✅ Your Supabase Credentials

Your Supabase project has been configured:

- **Project URL**: `https://lrzkpahlrmpujdlyiese.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyemtwYWhscm1wdWpkbHlpZXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1OTY5MjEsImV4cCI6MjA4MTE3MjkyMX0.eHAhpg88y0z0VCBEjljs6YRcYl78AEyh_LM7-HZwJO8`

## 📝 Create Your .env File

Create a `.env` file in the root directory with these values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://lrzkpahlrmpujdlyiese.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyemtwYWhscm1wdWpkbHlpZXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1OTY5MjEsImV4cCI6MjA4MTE3MjkyMX0.eHAhpg88y0z0VCBEjljs6YRcYl78AEyh_LM7-HZwJO8

# Backend Configuration
SUPABASE_URL=https://lrzkpahlrmpujdlyiese.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
PORT=5000

# Admin Panel
VITE_ADMIN_PASSWORD=UPI_ADMIN_2024

# Email Configuration (Gmail SMTP)
SMTP_EMAIL=no-reply.yourapp@gmail.com
SMTP_PASS=your_16_char_app_password
```

## 🔑 Get Your Service Role Key

1. Go to: https://supabase.com/dashboard/project/lrzkpahlrmpujdlyiese/settings/api
2. Find the **`service_role`** key (secret key)
3. Copy it and replace `your_service_role_key_here` in `.env`

⚠️ **Important**: Never commit the service role key to git!

## 🗄️ Run Database Migration

1. Go to: https://supabase.com/dashboard/project/lrzkpahlrmpujdlyiese/sql/new
2. Copy the entire contents of `supabase-migration.sql`
3. Paste into the SQL Editor
4. Click **Run** (or press Ctrl+Enter)
5. Verify success message

## 📧 Email Configuration (Gmail SMTP)

The app uses Nodemailer with Gmail SMTP to send OTP emails. Follow these steps:

### 1. Create Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable if not already enabled)
3. Go to **App passwords**: https://myaccount.google.com/apppasswords
4. Select **Mail** and **Other (Custom name)**
5. Enter "UPI Quiz App" as the name
6. Click **Generate**
7. Copy the 16-character app password (you'll use this as `SMTP_PASS`)

### 2. Update .env File

Add these lines to your `.env` file:

```env
SMTP_EMAIL=your-email@gmail.com
SMTP_PASS=your_16_char_app_password
```

**Important**: 
- Use your full Gmail address for `SMTP_EMAIL`
- Use the 16-character app password (not your regular Gmail password) for `SMTP_PASS`
- Never commit these credentials to git!

## ✅ Verify Setup

After completing the above steps:

1. **Check Database**: Go to Table Editor → Verify `game_sessions` table exists
2. **Check Auth**: Go to Authentication → Providers → Verify Email is enabled
3. **Test OTP**: Try signing up with an email to test OTP sending

## 🚀 Ready to Run

Once `.env` is configured with the service role key:

```bash
npm run install:all
npm run dev
```

Then visit http://localhost:3000

