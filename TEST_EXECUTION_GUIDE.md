# Test Execution Guide
**Purpose:** Step-by-step guide for comprehensive pre-deployment testing

---

## 🚀 SETUP

### 1. Clear Log File
Before starting tests, clear the debug log file:
- Log path: `d:\M.G's Projects\Upi Project\Trail 1\.cursor\debug.log`
- This ensures clean logs for each test run

### 2. Start Development Server
```bash
cd frontend
npm run dev
```

### 3. Open Browser
- Open Chrome/Edge/Firefox
- Navigate to: `http://localhost:3000`
- Open Developer Tools (F12) → Console tab (to see any errors)

---

## 📋 TEST EXECUTION SEQUENCE

### TEST 1: Admin Panel Login Flow

**Steps:**
1. Navigate to `http://localhost:3000/admin`
2. **Expected:** Login form appears
3. Try logging in with **empty password**
   - **Expected:** "Password is required" error
4. Try logging in with **incorrect password**
   - **Expected:** "Invalid password" error
5. Log in with **correct password** (check `.env` for `ADMIN_PASSWORD`)
   - **Expected:** Dashboard loads, shows stats and sessions table

**Verify in Logs:**
- `AdminPanel.jsx:useEffect:sessionCheck` - Session check logged
- `AdminPanel.jsx:handleLogin:START` - Login attempt logged
- `AdminPanel.jsx:handleLogin:LOGIN_SUCCESS` - Success logged
- `AdminPanel.jsx:loadData:START` - Data loading started
- `AdminPanel.jsx:loadData:SUCCESS` - Data loaded with record count

**Check:**
- ✅ Stats display correctly (Total Participants, Wins, Losses)
- ✅ Sessions table displays data
- ✅ Table scrolls vertically (if many records)
- ✅ Sticky header works while scrolling

---

### TEST 2: Admin Panel Data Operations

**Steps:**
1. While logged into admin panel:
2. Click **"Refresh Data"** button
   - **Expected:** Data reloads, loading indicator shows
3. Click **"Export CSV"** button
   - **Expected:** CSV file downloads with all session data
4. Open downloaded CSV file
   - **Expected:** Contains all columns: Name, Email, Destination, OTP Verified, Game Result, Timestamp
5. Click **"Logout"** button
   - **Expected:** Returns to login screen

**Verify in Logs:**
- `AdminPanel.jsx:loadData:SUCCESS` - Refresh logged
- `AdminPanel.jsx:exportCSV:START` - Export started
- `AdminPanel.jsx:exportCSV:SUCCESS` - Export completed with row count

**Check:**
- ✅ CSV contains correct data
- ✅ CSV handles special characters correctly
- ✅ Logout clears session

---

### TEST 3: User Flow - Welcome Screen

**Steps:**
1. Navigate to `http://localhost:3000/`
2. **Expected:** Welcome screen with country flags
3. Click on any country flag (e.g., France 🇫🇷)
   - **Expected:** Navigates to user details form

**Check:**
- ✅ All country flags display correctly
- ✅ Flag images load (or emoji fallback works)
- ✅ Country selection works

---

### TEST 4: User Flow - User Details Form

**Steps:**
1. On user details form:
2. Try submitting with **empty name**
   - **Expected:** Validation error
3. Try submitting with **invalid email** (e.g., "test@")
   - **Expected:** Email validation error
4. Fill in valid details:
   - Name: "Test User"
   - Email: "test@example.com"
   - Select a destination
   - Check/uncheck "Receive Updates"
5. Submit form
   - **Expected:** Navigates to OTP verification page

**Check:**
- ✅ Form validation works
- ✅ Email format validation works
- ✅ Navigation works after valid submission

---

### TEST 5: OTP Flow - Send OTP

**Steps:**
1. On OTP verification page:
2. **Expected:** OTP email sent automatically
3. Check email inbox for OTP code
   - **Expected:** Email received with 4-digit OTP
4. Check browser console for any errors

**Verify in Logs:**
- `OTPVerification.jsx:sendOTP:START` - OTP send started
- `OTPVerification.jsx:sendOTP:SUCCESS` - OTP sent successfully

**Check:**
- ✅ OTP email received
- ✅ OTP is 4 digits
- ✅ No errors in console

---

### TEST 6: OTP Flow - Verify OTP

**Steps:**
1. Enter **incorrect OTP** (e.g., "0000")
   - **Expected:** "Invalid OTP" error
2. Enter **correct OTP** from email
   - **Expected:** Navigates to quiz game
3. Check that OTP input accepts 4 digits
4. Test **paste functionality** (if implemented)

**Verify in Logs:**
- `OTPVerification.jsx:verifyOTP:START` - Verification started
- `OTPVerification.jsx:verifyOTP:SUCCESS` - Verification successful
- OR `OTPVerification.jsx:verifyOTP:FAILED` - If incorrect

**Check:**
- ✅ Correct OTP works
- ✅ Incorrect OTP shows error
- ✅ Navigation to quiz game works

---

### TEST 7: Quiz Game - Correct Answer

**Steps:**
1. On quiz game page:
2. **Expected:** Timer shows 30 seconds and counts down
3. **Expected:** Question displays correctly
4. **Expected:** 3 answer options display
5. Click the **correct answer**
   - **Expected:** 
     - Confetti animation plays
     - "You Won!" message appears
     - Timer stops
     - Auto-redirects to welcome screen after 5 seconds

**Verify in Logs:**
- `QuizGame.jsx:checkIfPlayed:GAME_START` - Game started
- `QuizGame.jsx:handleAnswer:START` - Answer selected (isCorrect: true)
- `QuizGame.jsx:handleAnswer:SAVE_SUCCESS` - Result saved (win)

**Check:**
- ✅ Timer starts at 30 seconds
- ✅ Timer counts down correctly
- ✅ Correct answer shows win message
- ✅ Confetti animation works
- ✅ Result saved to database
- ✅ Auto-redirect works

---

### TEST 8: Quiz Game - Incorrect Answer

**Steps:**
1. Start a new game (use different email)
2. Click an **incorrect answer**
   - **Expected:**
     - Shake animation
     - "Better Luck Next Time" message
     - Timer stops
     - Auto-redirects after 5 seconds

**Verify in Logs:**
- `QuizGame.jsx:handleAnswer:START` - Answer selected (isCorrect: false)
- `QuizGame.jsx:handleAnswer:SAVE_SUCCESS` - Result saved (loss)

**Check:**
- ✅ Incorrect answer shows loss message
- ✅ Shake animation works
- ✅ Result saved correctly

---

### TEST 9: Quiz Game - Timeout

**Steps:**
1. Start a new game (use different email)
2. **Don't click any answer**
3. Wait for timer to reach 0
   - **Expected:**
     - "Time's Up!" message appears
     - Timer stops at 0
     - Auto-redirects after 5 seconds

**Verify in Logs:**
- `QuizGame.jsx:timer:TIMEOUT` - Timer expired
- `QuizGame.jsx:handleAnswer:START` - Answer selected (isTimeout: true)
- `QuizGame.jsx:handleAnswer:SAVE_SUCCESS` - Result saved (loss)

**Check:**
- ✅ Timer expires correctly
- ✅ Timeout message displays
- ✅ Result saved as loss

---

### TEST 10: Duplicate Play Prevention

**Steps:**
1. Complete a full game flow (welcome → details → OTP → quiz)
2. Try to play again with the **same email**
3. **Expected:** 
   - After OTP verification, shows "You have already played" message
   - Redirects to welcome screen

**Verify in Logs:**
- `QuizGame.jsx:checkIfPlayed:ALREADY_PLAYED` - User already played detected

**Check:**
- ✅ Duplicate play prevented
- ✅ Error message displays
- ✅ Redirect works

---

### TEST 11: Error Handling - Network Failure

**Steps:**
1. Open browser DevTools → Network tab
2. Set network to **"Offline"**
3. Try to send OTP
   - **Expected:** Error message displayed
4. Try to verify OTP
   - **Expected:** Error message displayed
5. Try admin login
   - **Expected:** Error message displayed

**Check:**
- ✅ Error messages are user-friendly
- ✅ App doesn't crash
- ✅ Error boundary catches any crashes

---

### TEST 12: Rate Limiting

**Steps:**
1. Try sending OTP **4 times rapidly** (within 1 minute)
2. **Expected:** 
   - First 3 requests succeed
   - 4th request shows rate limit error

**Check:**
- ✅ Rate limiting works (3 requests per minute)
- ✅ Error message is clear

---

### TEST 13: Admin Panel Scrolling

**Steps:**
1. Log into admin panel
2. If you have many sessions (10+), verify:
   - Table scrolls vertically
   - Header stays visible (sticky)
   - All data is accessible via scrolling

**Check:**
- ✅ Vertical scrolling works
- ✅ Horizontal scrolling works (on mobile/small screens)
- ✅ Sticky header works
- ✅ All data visible via scrolling

---

### TEST 14: Data Integrity

**Steps:**
1. Complete a full game flow
2. Log into admin panel
3. Verify the session appears in the table:
   - Name matches
   - Email matches
   - Destination matches
   - Game result matches (win/loss)
   - Timestamp is correct

**Check:**
- ✅ Data saved correctly
- ✅ Data displays correctly in admin panel
- ✅ CSV export matches database data

---

## 📊 LOG ANALYSIS

After completing all tests, analyze the log file:

**Location:** `d:\M.G's Projects\Upi Project\Trail 1\.cursor\debug.log`

**What to Check:**
1. All critical flows logged successfully
2. No unexpected errors
3. All API calls succeeded
4. Data operations completed
5. Timer and game logic worked correctly

**Expected Log Patterns:**
- ✅ `START` → `SUCCESS` (for successful operations)
- ✅ `START` → `FAILED` or `ERROR` (for expected failures)
- ✅ No missing log entries for critical operations

---

## ✅ TEST COMPLETION CHECKLIST

- [ ] All 14 test scenarios completed
- [ ] Log file reviewed
- [ ] No critical errors found
- [ ] All user flows work correctly
- [ ] Admin panel works correctly
- [ ] Data integrity verified
- [ ] Error handling works
- [ ] Rate limiting works
- [ ] Scrolling works in admin panel
- [ ] Performance is acceptable

---

## 🚨 ISSUES FOUND

Document any issues found during testing:

| Issue # | Description | Severity | Component | Status |
|---------|-------------|----------|-----------|--------|
| 1 | | | | |
| 2 | | | | |

**Severity Levels:**
- 🔴 **CRITICAL:** Blocks deployment
- 🟡 **HIGH:** Should fix before deployment
- 🟢 **MEDIUM:** Can fix after deployment
- ⚪ **LOW:** Nice to have

---

## 📝 TEST RESULTS SUMMARY

**Test Date:** _________________  
**Tester:** _________________  
**Environment:** Local / Production  
**Total Tests:** 14  
**Passed:** ___  
**Failed:** ___  
**Blocking Issues:** ___

**Overall Status:** ☐ ✅ PASS / ☐ ⚠️ PASS WITH ISSUES / ☐ ❌ FAIL

**Approved for Deployment:** ☐ YES ☐ NO

**Notes:**
_________________________________________________
_________________________________________________

---

**Next Steps:**
1. Fix any critical/high issues found
2. Re-run failed tests
3. Review logs again
4. Get approval for deployment

