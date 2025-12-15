# Email Setup Guide - Gmail SMTP with Nodemailer

This guide will help you configure email sending for OTP verification using Gmail SMTP.

## 📧 Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification** if not already enabled
   - This is required to generate app passwords

## 🔑 Step 2: Generate Gmail App Password

1. Go to App Passwords: https://myaccount.google.com/apppasswords
2. Select **Mail** from the dropdown
3. Select **Other (Custom name)** from device dropdown
4. Enter "UPI Quiz App" as the custom name
5. Click **Generate**
6. **Copy the 16-character password** (you'll need this!)

The password will look like: `abcd efgh ijkl mnop`

## ⚙️ Step 3: Configure .env File

Add these lines to your `.env` file in the root directory:

```env
# Email Configuration (Gmail SMTP)
SMTP_EMAIL=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop
```

**Important Notes:**
- `SMTP_EMAIL`: Your full Gmail address (e.g., `no-reply.yourapp@gmail.com`)
- `SMTP_PASS`: The 16-character app password (remove spaces if any)
- **Never use your regular Gmail password** - only use the app password!

## ✅ Step 4: Test Email Sending

1. Start your backend server:
   ```bash
   npm run dev
   ```

2. Try the OTP flow in your app
3. Check your email inbox for the OTP code
4. Check backend console for email sending logs

## 🐛 Troubleshooting

### Email Not Sending?

1. **Check App Password**: Make sure you're using the 16-character app password, not your regular password
2. **Check 2-Step Verification**: Must be enabled to generate app passwords
3. **Check .env File**: Ensure `SMTP_EMAIL` and `SMTP_PASS` are set correctly
4. **Check Backend Logs**: Look for error messages in the console
5. **Check Gmail**: Sometimes emails go to spam folder

### Common Errors

**Error: Invalid login**
- Solution: Make sure you're using the app password, not your regular Gmail password

**Error: Less secure app access**
- Solution: Enable 2-Step Verification and use App Password instead

**Error: Connection timeout**
- Solution: Check your firewall/network settings, port 465 should be open

## 🔒 Security Best Practices

1. ✅ Use App Passwords (not regular passwords)
2. ✅ Keep `.env` file secure (never commit to git)
3. ✅ Use a dedicated Gmail account for production
4. ✅ Enable 2-Step Verification
5. ✅ Regularly rotate app passwords

## 📝 Alternative Email Providers

If you prefer not to use Gmail, you can modify `backend/utils/email.js` to use:

- **SendGrid**: https://sendgrid.com/
- **AWS SES**: https://aws.amazon.com/ses/
- **Mailgun**: https://www.mailgun.com/
- **Outlook/Hotmail**: Similar setup with different SMTP settings

For other providers, update the transporter configuration in `backend/utils/email.js`.

