# Next.js 14.2.1 Conversion Guide (Without TypeScript)

This guide explains how to convert the remaining TypeScript files to JavaScript for Next.js.

## What's Been Converted

### ✅ Core Configuration
- `package.json` - Updated with Next.js 14.2.1 dependencies
- `next.config.js` - Next.js configuration with CORS headers and SVG support
- `jsconfig.json` - Path aliases configuration

### ✅ Core App Structure
- `app/layout.js` - Root layout with Zoom client initialization
- `app/page.js` - Home page component
- `src/context/zoom-context.js` - Zoom context (converted)
- `src/context/media-context.js` - Media context (converted)
- `src/config/dev.js` - Development config (converted)
- `src/utils/util.js` - Utility functions (converted)
- `src/utils/platform.js` - Platform detection (converted)
- `src/component/icon-font.js` - Icon font component (converted)
- `src/component/loading-layer.js` - Loading component (converted)
- `src/feature/home/home.js` - Home feature (converted)

## Conversion Steps for Remaining Files

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Copy VideoSDK Library Files
The VideoSDK requires library files in the public directory:
```bash
cp -r node_modules/@zoom/videosdk/dist/lib public/
```

### 3. Convert TypeScript Files to JavaScript

For each `.tsx` or `.ts` file, follow these steps:

#### Remove Type Annotations
**Before (TypeScript):**
```typescript
interface MyProps {
  name: string;
  age: number;
}

const MyComponent: React.FC<MyProps> = (props) => {
  const { name, age } = props;
  return <div>{name}</div>;
}
```

**After (JavaScript):**
```javascript
const MyComponent = (props) => {
  const { name, age } = props;
  return <div>{name}</div>;
}
```

#### Remove Type Imports
**Before:**
```typescript
import type { SomeType } from './types';
import { useState } from 'react';
```

**After:**
```javascript
import { useState } from 'react';
```

#### Convert Enums to Objects
**Before:**
```typescript
enum Status {
  Active = 'active',
  Inactive = 'inactive'
}
```

**After:**
```javascript
const Status = {
  Active: 'active',
  Inactive: 'inactive'
};
```

### 4. Update Routing

Replace `react-router` with Next.js routing:

**Before (react-router):**
```javascript
import { useNavigate } from 'react-router';

const navigate = useNavigate();
navigate('/video');
```

**After (Next.js):**
```javascript
'use client'; // Add at top of file

import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/video');
```

### 5. Create Route Pages

For each route, create a corresponding page in the `app` directory:

- `/video` → `app/video/page.js`
- `/chat` → `app/chat/page.js`
- `/command` → `app/command/page.js`
- `/subsession` → `app/subsession/page.js`
- `/preview` → `app/preview/page.js`

Each page should:
1. Start with `'use client';`
2. Import the feature component
3. Export default function that renders the component

**Example (`app/video/page.js`):**
```javascript
'use client';

import Video from '../../src/feature/video/video';

export default function VideoPage() {
  return <Video />;
}
```

### 6. Handle Client-Side Only Code

Wrap browser-specific code with checks:

```javascript
if (typeof window !== 'undefined') {
  // Browser-only code
  window.zmClient = zmClient;
}
```

### 7. Update SVG Imports

With `@svgr/webpack`, SVG imports work as components:

**Before:**
```typescript
import { ReactComponent as IconChat } from './icon-chat.svg';
```

**After:**
```javascript
import IconChat from './icon-chat.svg';
```

## File Conversion Priority

### High Priority (Core Features)
1. `src/feature/video/` - Video components
2. `src/feature/chat/` - Chat components
3. `src/feature/preview/preview.tsx` - Preview component

### Medium Priority
4. `src/feature/command/` - Command channel
5. `src/feature/subsession/` - Subsession management

### Low Priority (Can be done later)
6. Hook files in `src/hooks/`
7. Remaining utility files

## Running the Application

### Development
```bash
npm run dev
```

Visit `http://localhost:3000?sdkKey=YOUR_KEY&topic=test&name=User&signature=YOUR_SIGNATURE`

### Build
```bash
npm run build
npm start
```

## Common Issues and Solutions

### Issue: "Cannot find module" errors
**Solution:** Ensure all imports use `.js` extension or are properly configured in `jsconfig.json`

### Issue: SVG imports not working
**Solution:** Verify `@svgr/webpack` is installed and configured in `next.config.js`

### Issue: CORS errors with VideoSDK
**Solution:** The headers are configured in `next.config.js`. Ensure they're being applied.

### Issue: "window is not defined"
**Solution:** Add `'use client';` directive and wrap window access in `typeof window !== 'undefined'` checks

## Next Steps

1. Convert remaining feature components in `src/feature/`
2. Convert hook files in `src/hooks/`
3. Test each feature thoroughly
4. Remove old TypeScript configuration files (optional)

## Notes

- All components that use hooks, state, or browser APIs need `'use client';` directive
- Server components (without directive) cannot use useState, useEffect, etc.
- The VideoSDK library files must be in `public/lib/` directory
- Keep the same folder structure for easier maintenance
