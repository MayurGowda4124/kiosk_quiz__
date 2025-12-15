# Pre-Deployment Testing Plan
**Date:** Pre-Deployment  
**Purpose:** Comprehensive testing before production deployment

---

## 🎯 TESTING OBJECTIVES

1. Verify all critical user flows work correctly
2. Test error handling and edge cases
3. Verify data persistence and integrity
4. Test admin panel functionality
5. Verify UI/UX works correctly (scrolling, responsiveness)
6. Test API endpoints and serverless functions
7. Verify security measures (rate limiting, validation)

---

## 📋 TEST CHECKLIST

### 1. ENVIRONMENT SETUP ✅
- [ ] Environment variables configured in Vercel
- [ ] Database migrations run successfully
- [ ] All tables exist: `game_sessions`, `otp_codes`, `admin_tokens`
- [ ] SMTP credentials configured

### 2. ADMIN PANEL TESTS 🔐

#### 2.1 Admin Login
- [ ] Navigate to `/admin` route
- [ ] Login with correct password → Should succeed
- [ ] Login with incorrect password → Should show error
- [ ] Login with empty password → Should show validation error
- [ ] Session persists after page refresh
- [ ] Session expires after 24 hours

#### 2.2 Admin Dashboard
- [ ] Stats display correctly (Total Participants, Wins, Losses)
- [ ] Sessions table loads and displays data
- [ ] Table scrolls vertically when many sessions exist
- [ ] Table scrolls horizontally on mobile/small screens
- [ ] Header stays visible while scrolling (sticky header)
- [ ] Refresh Data button works
- [ ] Export CSV button works
- [ ] CSV export contains all data
- [ ] CSV export handles special characters correctly
- [ ] Logout works correctly

### 3. USER FLOW TESTS 👤

#### 3.1 Welcome Screen
- [ ] Page loads correctly
- [ ] All country flags display
- [ ] Country selection works
- [ ] Navigation to user details works

#### 3.2 User Details Form
- [ ] Form validation works (name required, email format)
- [ ] Email validation rejects invalid formats
- [ ] Name validation works
- [ ] Destination selection works
- [ ] "Receive Updates" checkbox works
- [ ] Form submission navigates to OTP page

#### 3.3 OTP Verification
- [ ] OTP email sent successfully
- [ ] OTP received in email inbox
- [ ] OTP input accepts 4 digits
- [ ] Auto-focus on first input works
- [ ] Paste OTP works (if implemented)
- [ ] Correct OTP verification succeeds
- [ ] Incorrect OTP shows error
- [ ] Expired OTP shows error
- [ ] Rate limiting works (max 3 requests per minute)
- [ ] Resend OTP works
- [ ] Navigation to quiz game works after verification

#### 3.4 Quiz Game
- [ ] Quiz game loads correctly
- [ ] Timer starts at 30 seconds
- [ ] Timer counts down correctly
- [ ] Timer stops when answer selected
- [ ] Correct answer shows win message + confetti
- [ ] Incorrect answer shows loss message
- [ ] Timeout shows "Time's Up" message
- [ ] Game result saves to database
- [ ] Auto-redirect to welcome screen after 5 seconds
- [ ] Cannot play twice with same email
- [ ] Flag images load correctly
- [ ] Fallback emoji shows if image fails

### 4. API ENDPOINT TESTS 🔌

#### 4.1 Health Check
- [ ] `GET /api/health` returns 200 OK

#### 4.2 Send OTP
- [ ] `POST /api/auth/send-otp` with valid data → Success
- [ ] `POST /api/auth/send-otp` with invalid email → 400 Error
- [ ] `POST /api/auth/send-otp` with missing fields → 400 Error
- [ ] Rate limiting works (3 requests/minute)
- [ ] OTP stored in database
- [ ] Email sent successfully

#### 4.3 Verify OTP
- [ ] `POST /api/auth/verify-otp` with correct OTP → Success
- [ ] `POST /api/auth/verify-otp` with incorrect OTP → 400 Error
- [ ] `POST /api/auth/verify-otp` with expired OTP → 400 Error
- [ ] `POST /api/auth/verify-otp` with invalid format → 400 Error
- [ ] Verification attempts limited (max 5)
- [ ] User data saved to database after verification

#### 4.4 Admin Login
- [ ] `POST /api/admin/login` with correct password → Success + Token
- [ ] `POST /api/admin/login` with incorrect password → 401 Error
- [ ] Token stored in database
- [ ] Token expires after 24 hours

#### 4.5 Admin Verify Token
- [ ] `POST /api/admin/verify` with valid token → Success
- [ ] `POST /api/admin/verify` with expired token → 401 Error
- [ ] `POST /api/admin/verify` with invalid token → 401 Error

#### 4.6 Stats
- [ ] `GET /api/stats` returns correct statistics
- [ ] Stats include total participants, wins, losses
- [ ] Stats include all sessions

#### 4.7 Export CSV
- [ ] `GET /api/export` returns CSV file
- [ ] CSV contains all session data
- [ ] CSV headers are correct
- [ ] CSV handles special characters correctly

### 5. ERROR HANDLING TESTS ⚠️

- [ ] Network failure during OTP send → Error message shown
- [ ] Network failure during OTP verify → Error message shown
- [ ] Network failure during admin login → Error message shown
- [ ] Invalid API response → Error handled gracefully
- [ ] Component crash → Error boundary catches it
- [ ] Database connection failure → Error message shown
- [ ] Email sending failure → Error handled gracefully

### 6. SECURITY TESTS 🔒

- [ ] Rate limiting prevents OTP spam
- [ ] Rate limiting prevents verification brute force
- [ ] Input validation prevents XSS
- [ ] CSV injection prevented
- [ ] Admin password not exposed in frontend
- [ ] CORS configured correctly
- [ ] Session tokens expire correctly

### 7. UI/UX TESTS 🎨

- [ ] Responsive design works on mobile
- [ ] Responsive design works on tablet
- [ ] Responsive design works on desktop
- [ ] Admin table scrolls vertically
- [ ] Admin table scrolls horizontally
- [ ] Sticky header works in admin table
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly
- [ ] Confetti animation works
- [ ] Timer display is visible
- [ ] Buttons are clickable and responsive

### 8. PERFORMANCE TESTS ⚡

- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second
- [ ] Admin panel loads < 2 seconds with 1000 records
- [ ] No memory leaks (test multiple sessions)
- [ ] Smooth scrolling in admin table
- [ ] No console errors

### 9. DATA INTEGRITY TESTS 💾

- [ ] User data saved correctly to database
- [ ] Game results saved correctly
- [ ] OTP codes expire after 5 minutes
- [ ] Admin tokens expire after 24 hours
- [ ] One game per email enforced
- [ ] Data persists after page refresh
- [ ] CSV export matches database data

### 10. BROWSER COMPATIBILITY 🌐

- [ ] Chrome (latest) - All features work
- [ ] Safari (latest) - All features work
- [ ] Firefox (latest) - All features work
- [ ] Edge (latest) - All features work
- [ ] Mobile Safari (iOS) - All features work
- [ ] Chrome Mobile (Android) - All features work

---

## 🧪 TEST EXECUTION LOG

### Test Run #1: [Date/Time]
**Tester:** [Name]  
**Environment:** Local / Production  
**Results:**

| Test Category | Passed | Failed | Notes |
|--------------|--------|--------|-------|
| Admin Panel | | | |
| User Flow | | | |
| API Endpoints | | | |
| Error Handling | | | |
| Security | | | |
| UI/UX | | | |
| Performance | | | |
| Data Integrity | | | |
| Browser Compatibility | | | |

**Issues Found:**
1. [Issue description]
2. [Issue description]

**Status:** ✅ PASS / ⚠️ PASS WITH ISSUES / ❌ FAIL

---

## 📊 SUCCESS CRITERIA

### Must Pass (Blockers):
- ✅ All critical user flows work
- ✅ Admin login works
- ✅ OTP send/verify works
- ✅ Quiz game works
- ✅ Data saves correctly
- ✅ No critical errors

### Should Pass (Important):
- ✅ Error handling works
- ✅ Rate limiting works
- ✅ Security measures work
- ✅ UI/UX is acceptable
- ✅ Performance is acceptable

### Nice to Have:
- ✅ All edge cases handled
- ✅ All browsers supported
- ✅ Perfect performance

---

## 🚨 KNOWN ISSUES

[List any known issues that don't block deployment]

---

## ✅ DEPLOYMENT APPROVAL

**Tested By:** _________________  
**Date:** _________________  
**Approved for Deployment:** ☐ YES ☐ NO  
**Notes:** _________________

---

## 📝 POST-DEPLOYMENT VERIFICATION

After deployment, verify:
1. [ ] Application loads without errors
2. [ ] All routes accessible
3. [ ] Admin panel works
4. [ ] OTP flow works
5. [ ] Quiz game works
6. [ ] No console errors
7. [ ] Performance is acceptable

---

**Last Updated:** [Date]

