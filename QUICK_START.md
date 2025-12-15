# Quick Start Guide - UPI Quiz Kiosk

## ✅ Your Supabase Credentials Are Configured!

Your Supabase project is already set up in `.env`:
- **Project URL**: https://lrzkpahlrmpujdlyiese.supabase.co
- **Anon Key**: ✅ Configured

## 🚀 Next Steps

### 1. Get Your Service Role Key (Required for Backend)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/lrzkpahlrmpujdlyiese
2. Navigate to **Settings** → **API**
3. Copy the **`service_role`** key (keep this secret!)
4. Update `.env` file:
   ```
   SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key_here
   ```

### 2. Run Database Migration

1. Open Supabase Dashboard → **SQL Editor**
2. Copy the entire contents of `supabase-migration.sql`
3. Paste and click **Run**
4. Verify the `game_sessions` table was created

### 3. Enable Email Provider

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure SMTP (or use Supabase default)
4. Test email sending if needed

### 4. Install Dependencies

```bash
npm run install:all
```

### 5. Start Development Server

```bash
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

### 6. Test the Flow

1. Open http://localhost:3000
2. Select a country flag
3. Enter name and email
4. Check your email for OTP
5. Enter OTP and play!

## 🔐 Admin Panel

Access at: http://localhost:3000/admin
- **Password**: `UPI_ADMIN_2024` (change in `.env`)

## 📝 Important Notes

- ⚠️ **Service Role Key**: Required for backend API endpoints
- ⚠️ **Email Provider**: Must be enabled for OTP to work
- ⚠️ **Database Migration**: Must run before first use
- ✅ **Anon Key**: Already configured in `.env`

## 🐛 Troubleshooting

**OTP not sending?**
- Check Email provider is enabled in Supabase
- Verify SMTP settings
- Check Supabase logs

**Database errors?**
- Ensure migration SQL was run successfully
- Check table exists in Supabase Dashboard → Table Editor

**Backend not working?**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set in `.env`
- Check backend console for errors

## 🎉 You're Ready!

Once you complete steps 1-3 above, you can start the app and test the full flow!

