# Quick Start Guide - Next.js 14.2.1 VideoSDK Demo

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
cd "/home/ajaythanki/Desktop/Health Unwired/videosdk-web-sample"
npm install
```

### 2. Copy VideoSDK Library Files
The Zoom VideoSDK requires library files in the public directory:
```bash
cp -r node_modules/@zoom/videosdk/dist/lib public/
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Available Routes

### ✅ Fully Functional
- **`/`** - Home page with feature navigation
- **`/preview`** - Audio/video preview and testing
- **`/chat`** - Chat feature (requires active session)
- **`/command`** - Command channel (requires active session)

### ⏳ Partially Functional
- **`/video`** - Video gallery (needs additional component conversion)
- **`/subsession`** - Subsession management (needs conversion)

## 🔑 Configuration

### Using Development Config
The app uses default credentials from `src/config/dev.js`. To customize:

```javascript
// src/config/dev.js
export const devConfig = {
  sdkKey: 'YOUR_SDK_KEY',
  sdkSecret: 'YOUR_SDK_SECRET',
  topic: 'your-session-name',
  name: 'Your Name',
  password: 'session-password',
  // ...
};
```

### Using URL Parameters
Pass credentials via URL:
```
http://localhost:3000?sdkKey=YOUR_KEY&topic=test&name=User&signature=YOUR_SIGNATURE
```

## 🧪 Testing Features

### Preview Feature
1. Go to `/preview`
2. Test microphone and speaker
3. Test camera and virtual background
4. Check audio/video levels

### Chat Feature
1. Join a session from home page
2. Go to `/chat`
3. Send messages to participants
4. Upload and download files

### Command Feature
1. Join a session
2. Go to `/command`
3. Send command channel messages

## 📊 Conversion Status

**Overall: ~70% Complete**

- ✅ Configuration & Infrastructure: 100%
- ✅ All Hooks: 100%
- ✅ Home, Preview, Chat, Command: 100%
- ⏳ Video Feature: ~20%
- ⏳ Subsession Feature: 0%

## 🛠️ Build for Production

```bash
npm run build
npm start
```

## 📚 Documentation Files

- `README.md` - Complete project overview
- `NEXTJS_CONVERSION_GUIDE.md` - Conversion patterns and instructions
- `CONVERSION_PROGRESS.md` - Detailed progress tracking
- `FINAL_CONVERSION_STATUS.md` - Current status summary
- `QUICK_START.md` - This file

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port
PORT=3001 npm run dev
```

### VideoSDK Library Not Found
```bash
# Ensure library files are copied
ls public/lib
# If empty, run:
cp -r node_modules/@zoom/videosdk/dist/lib public/
```

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 💡 Next Steps

1. **Test Current Features** - Try preview, chat, and command
2. **Convert Video Components** - Complete the video feature
3. **Convert Subsession** - Add subsession functionality
4. **Deploy** - Build and deploy to production

## 🎯 Key Features Working

- ✅ Zoom session initialization
- ✅ Audio/video preview with device selection
- ✅ Chat with file upload/download
- ✅ Command channel messaging
- ✅ Participant management
- ✅ Network quality indicators
- ⏳ Video gallery view
- ⏳ Screen sharing
- ⏳ Recording
- ⏳ Subsessions

## 📞 Need Help?

- Check `NEXTJS_CONVERSION_GUIDE.md` for conversion patterns
- Review converted files for examples
- See `FINAL_CONVERSION_STATUS.md` for what's left to convert
