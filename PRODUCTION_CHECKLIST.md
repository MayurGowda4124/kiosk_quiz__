# PRODUCTION DEPLOYMENT CHECKLIST

## Pre-Deployment Requirements

### 1. Database Setup ⚠️ CRITICAL

**Run these SQL migrations in Supabase:**

```sql
-- 1. Create OTP codes table (from supabase-otp-table.sql)
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  name TEXT NOT NULL,
  destination TEXT,
  destination_code TEXT,
  receive_updates BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);

ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage OTP codes"
  ON otp_codes
  FOR ALL
  USING (auth.role() = 'service_role');
```

**Verify:**
- [ ] `otp_codes` table exists
- [ ] Indexes created
- [ ] RLS enabled

### 2. Environment Variables ⚠️ CRITICAL

**Set in Vercel Dashboard → Settings → Environment Variables:**

#### Frontend Variables:
```
VITE_SUPABASE_URL = your_supabase_url
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
VITE_BACKEND_URL = https://your-project.vercel.app (or leave empty for relative URLs)
VITE_ADMIN_PASSWORD = your_secure_admin_password
```

#### Backend API Variables:
```
SUPABASE_URL = your_supabase_url
SUPABASE_SERVICE_ROLE_KEY = your_supabase_service_role_key
SMTP_EMAIL = your_gmail@gmail.com
SMTP_PASS = your_gmail_app_password
ADMIN_PASSWORD = your_secure_admin_password (same as VITE_ADMIN_PASSWORD)
NODE_ENV = production
ALLOWED_ORIGINS = https://your-domain.vercel.app,https://your-custom-domain.com
```

**Important:**
- `ADMIN_PASSWORD` must be set (no fallback)
- `ALLOWED_ORIGINS` should list your production domains (comma-separated)
- Use strong passwords (min 16 characters)

### 3. Security Verification

- [ ] Admin password is strong and unique
- [ ] No hardcoded secrets in code
- [ ] CORS origins configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation active

### 4. Functionality Testing

#### OTP Flow:
- [ ] Send OTP with valid email
- [ ] Send OTP with invalid email (should fail)
- [ ] Verify correct OTP
- [ ] Verify incorrect OTP (should fail)
- [ ] Verify expired OTP (should fail)
- [ ] Rate limiting works (try 4+ requests)

#### Quiz Flow:
- [ ] Select country
- [ ] Enter user details
- [ ] Complete OTP verification
- [ ] Answer quiz correctly (should show win)
- [ ] Answer quiz incorrectly (should show loss)
- [ ] Timer expires (should show time up)
- [ ] Game result saved to database

#### Admin Panel:
- [ ] Login with correct password
- [ ] Login with incorrect password (should fail)
- [ ] View sessions list
- [ ] Export CSV
- [ ] Logout works

### 5. Error Scenarios

- [ ] Network failure during OTP send
- [ ] Network failure during OTP verify
- [ ] Supabase connection failure
- [ ] Invalid API responses
- [ ] Component crashes (error boundary should catch)

### 6. Performance

- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second
- [ ] No memory leaks (test multiple game sessions)
- [ ] Admin panel loads quickly (< 2 seconds for 1000 records)

### 7. Browser Compatibility

- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### 8. Monitoring Setup

- [ ] Error tracking configured (Sentry recommended)
- [ ] Vercel Analytics enabled
- [ ] API function logs monitored
- [ ] Database query performance monitored

---

## Post-Deployment Verification

### Immediate Checks (First 24 Hours):

1. **Monitor Error Rates:**
   - Check Vercel function logs
   - Check error tracking service
   - Verify no critical errors

2. **Test User Flow:**
   - Complete end-to-end test
   - Verify OTP emails arrive
   - Verify database saves work

3. **Performance Monitoring:**
   - Check API response times
   - Monitor database query performance
   - Check memory usage

4. **Security Monitoring:**
   - Check for suspicious activity
   - Monitor rate limit triggers
   - Review failed login attempts

---

## Rollback Plan

If critical issues found:

1. **Immediate Rollback:**
   - Go to Vercel Dashboard
   - Find previous successful deployment
   - Click "Promote to Production"

2. **Database Rollback:**
   - OTP table can remain (backward compatible)
   - No data loss expected

3. **Environment Variables:**
   - Keep same values
   - No changes needed

---

## Known Limitations

1. **Rate Limiting:** Per-instance (in-memory), not shared across instances
2. **Admin Auth:** Simple token-based, upgrade to JWT recommended
3. **OTP Cleanup:** Manual cleanup needed (or scheduled job)
4. **Pagination:** Limited to 1000 records in admin panel

---

## Support Contacts

- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **Supabase Support:** [supabase.com/support](https://supabase.com/support)

---

## Success Criteria

✅ **Deployment Successful If:**
- All environment variables set
- Database migrations run
- All tests pass
- No critical errors in logs
- User flow works end-to-end
- Admin panel accessible

✅ **Production Ready:**
- Monitoring active
- Error tracking configured
- Performance acceptable
- Security measures active

