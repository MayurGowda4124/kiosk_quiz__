# UPI Quiz Kiosk - Project Structure

## 📁 Directory Structure

```
upi-quiz-kiosk/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── WelcomeScreen.jsx      # Country flag selection
│   │   │   ├── UserDetailsForm.jsx    # Name, email, destination form
│   │   │   ├── OTPVerification.jsx    # 6-digit OTP input & verification
│   │   │   ├── QuizGame.jsx            # Quiz with timer & outcomes
│   │   │   ├── VirtualKeyboard.jsx    # Touch-friendly keyboard
│   │   │   └── AdminPanel.jsx          # Admin dashboard
│   │   ├── lib/
│   │   │   └── supabase.js             # Supabase client config
│   │   ├── App.jsx                     # Main app router
│   │   ├── main.jsx                    # React entry point
│   │   └── index.css                   # Global styles + Tailwind
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend/                     # Node.js + Express backend
│   ├── server.js                # API endpoints + daily export
│   └── package.json
│
├── supabase-migration.sql       # Database schema
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json                 # Root package.json (concurrently)
├── README.md                    # Main documentation
├── SETUP.md                     # Detailed setup guide
├── KIOSK_START.bat             # Windows kiosk launcher
└── KIOSK_START.sh              # Linux/macOS kiosk launcher
```

## 🎯 Component Flow

```
WelcomeScreen (/) 
  ↓ [Select Country]
UserDetailsForm (/user-details)
  ↓ [Enter Name, Email]
OTPVerification (/otp-verify)
  ↓ [Verify Email]
QuizGame (/game)
  ↓ [Answer Question]
Result Screen
  ↓ [Auto-reset after 5s]
WelcomeScreen (/)
```

## 🔐 Authentication Flow

1. User enters email → Supabase sends OTP
2. User enters 6-digit OTP → Supabase verifies
3. Session created → Check if email already played
4. If new → Create game_session record
5. If existing → Block and redirect

## 📊 Database Schema

**Table: `game_sessions`**
- `id` (UUID, Primary Key)
- `email` (TEXT, Unique, Not Null)
- `name` (TEXT, Not Null)
- `destination` (TEXT, Not Null)
- `destination_code` (TEXT, Not Null)
- `receive_updates` (BOOLEAN, Default: false)
- `otp_verified` (BOOLEAN, Default: false)
- `game_result` (TEXT: 'win' | 'loss' | NULL)
- `answered_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ, Default: NOW())
- `updated_at` (TIMESTAMPTZ, Default: NOW())

## 🎨 Brand Colors

- **Primary Blue**: `#0066CC` - Trust, security
- **Orange/Red**: `#FF6600` - Energy, action (CTAs)
- **Green**: `#00CC66` - Growth, success (wins)
- **White**: Background clarity

## 📱 Responsive Breakpoints

- **iPad Landscape**: 1024×768 (primary target)
- **TV Display**: 1920×1080 (secondary target)
- Uses `vw`/`vh` units for scaling
- Fixed 16:9 aspect ratio maintained

## 🔒 Security Features

1. **One Game Per Email**: Enforced at database level (UNIQUE constraint)
2. **No Back Navigation**: `popstate` event prevention
3. **Session-Based Auth**: Supabase Auth sessions
4. **RLS Policies**: Row Level Security enabled
5. **Admin Password**: Protected admin panel

## 📈 Admin Features

- Total participants count
- Win/Loss statistics
- Manual CSV export
- Auto daily CSV export (midnight)
- View all game sessions

## 🚀 Deployment Checklist

- [ ] Set up Supabase project
- [ ] Run database migration
- [ ] Configure email provider
- [ ] Set environment variables
- [ ] Build frontend (`npm run build`)
- [ ] Deploy frontend to static host
- [ ] Deploy backend to server
- [ ] Configure kiosk mode
- [ ] Test on iPad/TV
- [ ] Set up daily export monitoring
- [ ] Change default admin password

## 🐛 Known Considerations

1. **Logo**: Placeholder for UPI logo (to be added to header)
2. **Email Templates**: Configure in Supabase dashboard
3. **SMTP**: Use Supabase default or configure custom
4. **CORS**: May need configuration for production domain
5. **HTTPS**: Required for production (Supabase requirement)

## 📝 Notes

- Virtual keyboard appears automatically for all text inputs
- OTP expires in 60 seconds (Supabase default)
- Game timer: 10 seconds
- Auto-reset delay: 5 seconds after result
- Confetti animation: Medium intensity (100 particles)
- No sound or haptics (as per requirements)

