# UPI Quiz Kiosk

Production-ready touchscreen quiz game for UPI brand activation kiosk.

## 🎯 Features

- **Welcome Screen** with 8 country flags (Bhutan, France, Nepal, UAE, Mauritius, Singapore, Sri Lanka, Qatar)
- **User Details Form** with virtual keyboard
- **Supabase Email OTP** authentication
- **Quiz Game** with 10-second timer
- **Admin Panel** with analytics and CSV export
- **Responsive Design** for iPad (1024×768) and 32" TV (1920×1080)
- **Kiosk-Safe UX** with no back navigation

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database & Auth**: Supabase
- **Confetti**: canvas-confetti

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Chrome browser (for kiosk mode)

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm run install:all
```

### 2. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run this SQL to create the `game_sessions` table:

```sql
CREATE TABLE game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  destination_code TEXT NOT NULL,
  receive_updates BOOLEAN DEFAULT false,
  otp_verified BOOLEAN DEFAULT false,
  game_result TEXT,
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email ON game_sessions(email);
CREATE INDEX idx_created_at ON game_sessions(created_at);
```

3. Enable Email OTP in Supabase Dashboard:
   - Go to Authentication > Providers
   - Enable Email provider
   - Configure email templates if needed

### 3. Environment Variables

Create `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=5000

VITE_ADMIN_PASSWORD=UPI_ADMIN_2024

# Email Configuration (Gmail SMTP)
SMTP_EMAIL=no-reply.yourapp@gmail.com
SMTP_PASS=your_16_char_app_password
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

The built files will be in `frontend/dist/`

## 📱 Kiosk Mode Setup

### iPad Setup (Chrome)

1. Install Chrome on iPad
2. Open Chrome and navigate to your app URL
3. Enable Kiosk Mode:
   - Settings > Accessibility > Guided Access
   - Enable Guided Access
   - Triple-click home button to enter kiosk mode

### Chrome Kiosk Mode (Desktop/TV)

```bash
# Windows
chrome.exe --kiosk --fullscreen http://localhost:3000

# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --kiosk --fullscreen http://localhost:3000

# Linux
google-chrome --kiosk --fullscreen http://localhost:3000
```

## 🎮 Game Flow

1. **Welcome Screen**: User selects a country flag
2. **User Details**: User enters name and email
3. **OTP Verification**: User receives and enters 6-digit OTP
4. **Quiz Game**: User answers question within 10 seconds
5. **Result**: Win/Loss message displayed
6. **Auto-reset**: Returns to welcome screen after 5 seconds

## 🔐 Security Features

- One game per verified email (enforced at database level)
- No back navigation
- Session-based authentication
- Auto-reset after game completion

## 📊 Admin Panel

Access at `/admin` route.

**Default Password**: `UPI_ADMIN_2024` (set via `VITE_ADMIN_PASSWORD`)

**Features**:
- View total participants
- View win/loss statistics
- Export CSV manually
- Auto daily CSV export (runs at midnight)

## 📁 Project Structure

```
.
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── WelcomeScreen.jsx
│   │   │   ├── UserDetailsForm.jsx
│   │   │   ├── OTPVerification.jsx
│   │   │   ├── QuizGame.jsx
│   │   │   ├── VirtualKeyboard.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── lib/
│   │   │   └── supabase.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── server.js
│   └── package.json
├── .env.example
├── package.json
└── README.md
```

## 🎨 Branding

- **Primary Color**: Blue (#0066CC) - Trust, security
- **CTA Color**: Orange (#FF6600) - Energy, action
- **Success Color**: Green (#00CC66) - Growth, success
- **Background**: White - Clarity

## 📝 Notes

- Virtual keyboard appears automatically for all text inputs
- OTP expires in 60 seconds (Supabase default)
- Game sessions are stored for 6 months
- Daily CSV exports are saved in `backend/exports/`

## 🐛 Troubleshooting

**OTP not sending?**
- Check Supabase email provider settings
- Verify SMTP configuration in Supabase dashboard

**Database errors?**
- Ensure `game_sessions` table exists
- Check Supabase connection strings

**Virtual keyboard not appearing?**
- Ensure inputs are focused
- Check browser console for errors

## 📄 License

Proprietary - UPI Brand Activation

