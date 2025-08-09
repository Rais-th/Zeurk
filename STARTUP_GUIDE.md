# Zeurk App Startup Guide

## Quick Start (Recommended)

### Option 1: Simple npm start
```bash
npm start
```

### Option 2: Use the startup script (handles issues automatically)
```bash
./start-app.sh
```

### Option 3: Manual with cache clearing
```bash
npm run start:clear
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the development server |
| `npm run start:clear` | Start with cache clearing |
| `npm run reset` | Start with full cache reset |
| `npm run clean` | Clean install (removes node_modules) |
| `npm run web` | Start web version |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |

## Common Issues & Solutions

### 1. "expo: command not found"
**Solution**: Scripts now use `npx expo` instead of global `expo`

### 2. "Cannot find module 'dotenv/config'"
**Solution**: Run `npm install dotenv` or use the startup script

### 3. "ENOTEMPTY" npm cache errors
**Solution**: Run `npm run clean` or use the startup script

### 4. Port 8081 already in use
**Solution**: The startup script automatically kills existing processes

### 5. Import/bundling errors
**Solution**: Run `npm run reset` to clear all caches

## Troubleshooting Steps

If you encounter issues:

1. **First try**: `npm run reset`
2. **If that fails**: `npm run clean`
3. **Nuclear option**: Delete `node_modules` and `.expo` folders, then `npm install`

## Environment Setup

Ensure your `.env` file contains all required variables:
- Firebase configuration
- Twilio credentials
- API keys
- Webhook URLs

## Development Workflow

1. Start the app: `npm start`
2. Scan QR code with Expo Go app
3. Or press `w` for web, `i` for iOS simulator, `a` for Android

## Notes

- The app automatically loads environment variables from `.env`
- Metro bundler runs on `http://localhost:8081`
- All scripts use `npx` to avoid global dependency issues
- Cache clearing is built into most commands for reliability