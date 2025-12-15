# iPad Network Setup Guide

## Problem
When accessing the app from iPad, you get "load failed" because iPad can't reach `localhost:5000`.

## Solution
Use your computer's network IP address instead of `localhost`.

## Steps

### 1. Find Your Computer's IP Address

**Windows:**
```bash
ipconfig | findstr /i "IPv4"
```

**macOS/Linux:**
```bash
ifconfig | grep "inet "
```

You'll see something like: `10.230.131.114`

### 2. Update .env File

Add this line to your `.env` file in the root directory:

```env
VITE_BACKEND_URL=http://10.230.131.114:5000
```

**Important:** Replace `10.230.131.114` with YOUR actual IP address!

### 3. Restart Development Server

```bash
npm run dev
```

### 4. Access from iPad

1. Make sure iPad and computer are on the **same WiFi network**
2. On iPad, open browser and go to:
   ```
   http://10.230.131.114:3000
   ```
   (Replace with your actual IP)

### 5. Firewall Check (Windows)

If still not working, allow port 5000 through Windows Firewall:

1. Open Windows Defender Firewall
2. Advanced Settings → Inbound Rules → New Rule
3. Port → TCP → Specific local ports: `5000`
4. Allow the connection
5. Apply to all profiles
6. Name it "UPI Quiz Backend"

### 6. Verify Backend is Accessible

Test from iPad browser:
```
http://10.230.131.114:5000/api/health
```

Should return: `{"status":"ok"}`

## Troubleshooting

**Still not working?**

1. **Check same network**: iPad and computer must be on same WiFi
2. **Check firewall**: Windows Firewall might be blocking port 5000
3. **Check IP address**: IP might have changed (run `ipconfig` again)
4. **Check backend is running**: Make sure `npm run dev` is running
5. **Try ping**: From iPad, try to ping your computer's IP

## Production Deployment

For production, use a proper domain name or static IP, not localhost!

