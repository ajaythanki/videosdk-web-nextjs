# Ant Design Icons to React Icons Migration Map

## Complete Icon Replacement Guide

### Already Migrated Icons
- ✅ `UserOutlined` → `BsPerson`
- ✅ `DownOutlined` → `BsChevronDown`
- ✅ `CloseOutlined` → `BsX`
- ✅ `FileImageOutlined` → `BsFileImage`
- ✅ `FileOutlined` → `BsFileEarmark`
- ✅ `CheckOutlined` → `BsCheck`
- ✅ `DashOutlined` → `BsDash`

### Icons Still Using @ant-design/icons

#### Video Components
| Ant Design Icon | React Icons Replacement | Import |
|----------------|------------------------|--------|
| `CaretLeftOutlined` | `BsCaretLeft` | `react-icons/bs` |
| `CaretRightOutlined` | `BsCaretRight` | `react-icons/bs` |
| `UpOutlined` | `BsChevronUp` | `react-icons/bs` |
| `VideoCameraAddOutlined` | `BsCameraVideo` | `react-icons/bs` |
| `VideoCameraOutlined` | `BsCameraVideoOff` | `react-icons/bs` |
| `AudioMutedOutlined` | `BsMicMute` | `react-icons/bs` |
| `MoreOutlined` | `BsThreeDots` | `react-icons/bs` |
| `InfoCircleOutlined` | `BsInfoCircle` | `react-icons/bs` |
| `LockOutlined` | `BsLock` | `react-icons/bs` |
| `UnlockOutlined` | `BsUnlock` | `react-icons/bs` |
| `PlusOutlined` | `BsPlus` | `react-icons/bs` |
| `MinusOutlined` | `BsDash` | `react-icons/bs` |
| `RetweetOutlined` | `BsArrowRepeat` | `react-icons/bs` |
| `LoadingOutlined` | `BsArrowRepeat` (with spin) | `react-icons/bs` |

#### File Type Icons (chat-file-message-item.js)
| Ant Design Icon | React Icons Replacement | Import |
|----------------|------------------------|--------|
| `FileExcelOutlined` | `BsFileEarmarkExcel` | `react-icons/bs` |
| `FilePdfOutlined` | `BsFileEarmarkPdf` | `react-icons/bs` |
| `FileWordOutlined` | `BsFileEarmarkWord` | `react-icons/bs` |
| `FileZipOutlined` | `BsFileEarmarkZip` | `react-icons/bs` |
| `FilePptOutlined` | `BsFileEarmarkPpt` | `react-icons/bs` |

### Files Requiring Icon Migration

1. **src/component/loading-layer.js**
   - `LoadingOutlined` → `BsArrowRepeat` with CSS animation

2. **src/component/icon-font.js**
   - Uses `Icon from '@ant-design/icons'` for custom SVGs
   - Keep as is (custom SVG wrapper)

3. **src/component/audio-animation-icon.js**
   - Uses `Icon from '@ant-design/icons'` for custom SVGs
   - Keep as is (custom SVG wrapper)

4. **src/feature/video/components/pagination.js**
   - `CaretLeftOutlined` → `BsCaretLeft`
   - `CaretRightOutlined` → `BsCaretRight`

5. **src/feature/video/components/leave.js**
   - `UpOutlined` → `BsChevronUp`

6. **src/feature/video/components/avatar-more.js**
   - `CheckOutlined` → `BsCheck`
   - `MoreOutlined` → `BsThreeDots`

7. **src/feature/video/components/remote-camera-control.js**
   - `DownOutlined` → `BsChevronDown`
   - `UpOutlined` → `BsChevronUp`
   - `LeftOutlined` → `BsChevronLeft`
   - `RightOutlined` → `BsChevronRight`
   - `PlusOutlined` → `BsPlus`
   - `MinusOutlined` → `BsDash`
   - `RetweetOutlined` → `BsArrowRepeat`

8. **src/feature/video/components/camera.js**
   - `CheckOutlined` → `BsCheck`
   - `UpOutlined` → `BsChevronUp`
   - `VideoCameraAddOutlined` → `BsCameraVideo`
   - `VideoCameraOutlined` → `BsCameraVideoOff`

9. **src/feature/video/components/avatar.js**
   - `AudioMutedOutlined` → `BsMicMute`

10. **src/feature/video/components/microphone.js**
    - `CheckOutlined` → `BsCheck`
    - `UpOutlined` → `BsChevronUp`

11. **src/feature/video/components/report-btn.js**
    - `InfoCircleOutlined` → `BsInfoCircle`

12. **src/feature/video/components/screen-share.js**
    - `LockOutlined` → `BsLock`
    - `UnlockOutlined` → `BsUnlock`
    - `UpOutlined` → `BsChevronUp`
    - `CheckOutlined` → `BsCheck`

13. **src/feature/command/component/cmd-receiver.js**
    - `CheckOutlined` → `BsCheck`
    - `DownOutlined` → `BsChevronDown`

14. **src/feature/command/component/cmd-message-item.js**
    - `UserOutlined` → `BsPerson`

15. **src/feature/chat/component/chat-file-message-item.js**
    - `FileImageOutlined` → `BsFileImage`
    - `FileExcelOutlined` → `BsFileEarmarkExcel`
    - `FileOutlined` → `BsFileEarmark`
    - `FilePdfOutlined` → `BsFileEarmarkPdf`
    - `FileWordOutlined` → `BsFileEarmarkWord`
    - `FileZipOutlined` → `BsFileEarmarkZip`
    - `FilePptOutlined` → `BsFileEarmarkPpt`
    - `CloseOutlined` → `BsX`

## Migration Pattern

### Before:
```javascript
import { CheckOutlined, DownOutlined } from '@ant-design/icons';

<CheckOutlined />
<DownOutlined />
```

### After:
```javascript
import { BsCheck, BsChevronDown } from 'react-icons/bs';

<BsCheck />
<BsChevronDown />
```

## Special Cases

### Loading Icon with Animation
**Before:**
```javascript
import { LoadingOutlined } from '@ant-design/icons';
<LoadingOutlined />
```

**After:**
```javascript
import { BsArrowRepeat } from 'react-icons/bs';
<BsArrowRepeat className="spinning-icon" />

// Add CSS:
.spinning-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Custom SVG Icons (icon-font.js, audio-animation-icon.js)
These components use `Icon from '@ant-design/icons'` as a wrapper for custom SVGs.
**Keep these as is** - they're using Ant Design's Icon component as a utility, not for Ant Design's icons.
