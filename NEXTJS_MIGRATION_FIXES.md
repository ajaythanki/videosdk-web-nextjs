# Next.js Migration Fixes Required

## React Router to Next.js Navigation

### Files That Need Migration

The following TypeScript files still use `react-router` and need to be converted:

1. **src/App.tsx** - Uses `BrowserRouter, Routes, Route`
   - This file should be deleted as Next.js uses file-based routing
   
2. **src/feature/preview/preview.tsx** - Uses `useSearchParams from 'react-router'`
   - Already converted to preview.js but .tsx still exists
   
3. **src/feature/home/home.tsx** - Uses `useNavigate from 'react-router'`
   - Already converted to home.js but .tsx still exists

4. **src/feature/video/components/video-footer.tsx** - Uses `useSearchParams from 'react-router'`
   - Needs conversion or deletion

5. **src/feature/video/components/share-view/share-view.tsx** - Uses `useSearchParams from 'react-router'`
   - Already converted to .js

6. **src/feature/video/components/share-view/single-share-view.tsx** - Uses `useSearchParams from 'react-router'`
   - Already converted to .js

7. **src/feature/video/components/share-indication.tsx** - Uses `useSearchParams from 'react-router'`
   - Needs conversion

8. **src/feature/video/hooks/useShare.ts** - Uses `useSearchParams from 'react-router'`
   - Already has .js version

9. **src/feature/video/hooks/useMultiShare.ts** - Uses `useSearchParams from 'react-router'`
   - Already has .js version

10. **src/feature/subsession/subsession.tsx** - Uses `useSearchParams from 'react-router'`
    - Needs conversion

## Migration Strategy

### 1. Delete Old TypeScript Files
All `.tsx` and `.ts` files that have been converted to `.js` should be deleted:
- src/App.tsx (not needed in Next.js)
- src/feature/preview/preview.tsx
- src/feature/home/home.tsx
- src/feature/video/components/share-view/share-view.tsx
- src/feature/video/components/share-view/single-share-view.tsx
- All other .tsx/.ts files with .js equivalents

### 2. Convert Remaining TypeScript Files
Files that don't have .js versions yet:
- src/feature/video/components/video-footer.tsx → video-footer.js (already done)
- src/feature/video/components/share-indication.tsx → share-indication.js
- src/feature/subsession/subsession.tsx → subsession.js

### 3. Replace React Router Imports

**From:**
```javascript
import { useSearchParams } from 'react-router';
import { useNavigate } from 'react-router';
import { BrowserRouter, Routes, Route } from 'react-router';
```

**To:**
```javascript
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
// No BrowserRouter needed - Next.js uses file-based routing
```

### 4. Update Navigation Patterns

**From:**
```javascript
const navigate = useNavigate();
navigate('/path');
```

**To:**
```javascript
const router = useRouter();
router.push('/path');
```

### 5. Update Search Params Usage

**From:**
```javascript
const [searchParams] = useSearchParams();
const value = searchParams.get('key');
```

**To:**
```javascript
const searchParams = useSearchParams();
const value = searchParams.get('key');
```

## Action Items

1. ✅ Update home.js to use Next.js router
2. ⏳ Delete all .tsx/.ts files that have .js equivalents
3. ⏳ Convert remaining TypeScript files
4. ⏳ Remove react-router-dom from package.json
5. ⏳ Verify all navigation works with Next.js patterns
