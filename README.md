# Zoom Video SDK - Next.js 14.2.1 Demo (JavaScript)

This project has been converted from Vite + React + TypeScript to Next.js 14.2.1 with JavaScript.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Copy VideoSDK Library Files
The Zoom VideoSDK requires library files to be available in the public directory:
```bash
cp -r node_modules/@zoom/videosdk/dist/lib public/
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 4. Join a Session
Add query parameters to the URL:
```
http://localhost:3000?sdkKey=YOUR_SDK_KEY&topic=test&name=User&signature=YOUR_SIGNATURE
```

Or use the development config (already set in `src/config/dev.js`):
```
http://localhost:3000
```

## 📁 Project Structure

```
├── app/                      # Next.js App Router
│   ├── layout.js            # Root layout with Zoom initialization
│   ├── page.js              # Home page
│   ├── preview/             # Preview route
│   └── [other routes]/      # To be created
├── src/
│   ├── component/           # Reusable components
│   ├── config/              # Configuration files
│   ├── context/             # React contexts
│   ├── feature/             # Feature modules
│   │   ├── home/           # Home feature (converted)
│   │   ├── preview/        # Preview feature (converted)
│   │   ├── video/          # Video feature (needs conversion)
│   │   ├── chat/           # Chat feature (needs conversion)
│   │   ├── command/        # Command feature (needs conversion)
│   │   └── subsession/     # Subsession feature (needs conversion)
│   ├── hooks/              # Custom React hooks
│   └── utils/              # Utility functions
├── public/                  # Static assets
│   └── lib/                # VideoSDK library files (copy after install)
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies
└── NEXTJS_CONVERSION_GUIDE.md  # Detailed conversion guide
```

## ✅ What's Been Converted

### Core Files
- ✅ Next.js configuration (`next.config.js`, `package.json`)
- ✅ App layout with Zoom client initialization
- ✅ Context providers (Zoom, Media)
- ✅ Utility functions
- ✅ Home page and navigation
- ✅ Preview feature (complete example)
- ✅ Loading component
- ✅ Icon font component

### Hooks
- ✅ `useMount`, `useUnmount`
- ✅ `usePrevious`
- ⏳ Other hooks (need conversion)

## 🔧 Remaining Conversion Work

The following features need to be converted from TypeScript to JavaScript:

### High Priority
1. **Video Feature** (`src/feature/video/`)
   - Main video component
   - Video controls (camera, microphone, screen share)
   - Gallery view components

2. **Chat Feature** (`src/feature/chat/`)
   - Chat interface
   - Message components

3. **Command Feature** (`src/feature/command/`)
   - Command channel interface

4. **Subsession Feature** (`src/feature/subsession/`)
   - Subsession management

### Medium Priority
5. **Remaining Hooks** (`src/hooks/`)
   - Convert all TypeScript hooks to JavaScript

See `NEXTJS_CONVERSION_GUIDE.md` for detailed conversion instructions.

## 🎯 Features

- ✅ Audio/Video preview
- ✅ Session management
- ⏳ Gallery view (needs conversion)
- ⏳ Screen sharing (needs conversion)
- ⏳ Chat (needs conversion)
- ⏳ Command channel (needs conversion)
- ⏳ Subsessions (needs conversion)

## 🔑 Configuration

### Development Config
Edit `src/config/dev.js` to set your default SDK credentials:

```javascript
export const devConfig = {
  sdkKey: 'YOUR_SDK_KEY',
  sdkSecret: 'YOUR_SDK_SECRET',
  topic: 'testing',
  name: 'User',
  // ... other config
};
```

### Environment Variables
Create a `.env.local` file:
```
NEXT_PUBLIC_ZOOM_SDK_KEY=your_sdk_key
NEXT_PUBLIC_ZOOM_SDK_SECRET=your_sdk_secret
```

## 🛠️ Build for Production

```bash
npm run build
npm start
```

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Zoom Video SDK Documentation](https://marketplace.zoom.us/docs/sdk/video/web)
- [Conversion Guide](./NEXTJS_CONVERSION_GUIDE.md)

## ⚠️ Important Notes

1. **VideoSDK Library Files**: Must copy `node_modules/@zoom/videosdk/dist/lib` to `public/lib` after installation
2. **CORS Headers**: Configured in `next.config.js` for VideoSDK requirements
3. **Client Components**: All components using hooks need `'use client'` directive
4. **Browser APIs**: Wrap window/document access in `typeof window !== 'undefined'` checks

## 🐛 Troubleshooting

### "Cannot find module" errors
- Ensure all dependencies are installed: `npm install`
- Check that imports use correct paths

### SVG import errors
- Verify `@svgr/webpack` is installed
- Check `next.config.js` webpack configuration

### VideoSDK errors
- Ensure library files are copied to `public/lib/`
- Check CORS headers in `next.config.js`
- Verify SDK credentials are correct

### "window is not defined"
- Add `'use client'` directive to component
- Wrap browser code in `typeof window !== 'undefined'` checks

## 📝 License

See LICENSE.md

## 🤝 Contributing

See CONTRIBUTING.md
