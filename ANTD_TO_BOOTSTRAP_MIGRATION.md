# Ant Design to React Bootstrap Migration Guide

## Component Mapping

### Ant Design → React Bootstrap

| Ant Design | React Bootstrap | Notes |
|------------|----------------|-------|
| `Button` | `Button` | Similar API |
| `Input` | `Form.Control` | Different structure |
| `Select` | `Form.Select` | Different API |
| `Card` | `Card` | Similar structure |
| `Modal` | `Modal` | Similar API |
| `Dropdown` | `Dropdown` | Different structure |
| `Menu` | `Nav` / `Dropdown.Menu` | Different approach |
| `Progress` | `ProgressBar` | Similar API |
| `Checkbox` | `Form.Check` | Different structure |
| `Radio` | `Form.Check` (type="radio") | Different structure |
| `InputNumber` | `Form.Control` (type="number") | No built-in spinner |
| `Tooltip` | `OverlayTrigger` + `Tooltip` | More complex |
| `message` | `Toast` | Different API |
| `Form` | `Form` | Different validation approach |

### Icon Libraries

**Ant Design Icons:**
- `@ant-design/icons`

**React Bootstrap:**
- Use `react-icons` (includes Bootstrap Icons)
- Or `bootstrap-icons` package

## Files to Migrate

### Core Components (10 files)
- ✅ app/layout.js - Modal, message
- ⏳ src/feature/home/home.js - Card, Button
- ⏳ src/feature/preview/preview.js - Button, Progress, Select
- ⏳ src/component/loading-layer.js - Spin (if used)

### Chat Feature (5 files)
- ⏳ src/feature/chat/chat.js - Input
- ⏳ src/feature/chat/component/chat-message-item.js - Button
- ⏳ src/feature/chat/component/chat-receiver.js - Dropdown, Button
- ⏳ src/feature/chat/component/chat-file-message-item.js - Progress, Button
- ⏳ src/feature/chat/component/chat-image-message-item.js - Button

### Command Feature (3 files)
- ⏳ src/feature/command/command.js - Input
- ⏳ src/feature/command/component/cmd-message-item.js - Button
- ⏳ src/feature/command/component/cmd-receiver.js - Dropdown, Button, Menu

### Video Feature (15+ files)
- ⏳ src/feature/video/components/microphone.js - Button, Dropdown, Tooltip
- ⏳ src/feature/video/components/camera.js - Button, Dropdown
- ⏳ src/feature/video/components/leave.js - Button, Dropdown
- ⏳ src/feature/video/components/screen-share.js - Button, Dropdown, Tooltip
- ⏳ src/feature/video/components/avatar-more.js - Slider, Dropdown, Button
- ⏳ src/feature/video/components/pagination.js - Button
- ⏳ src/feature/video/components/report-btn.js - Button, Modal, List, Typography
- ⏳ src/feature/video/components/remote-camera-control.js - Button, Dropdown
- ⏳ src/feature/video/components/video-footer.js - Button, Modal, Form, Select, Checkbox, Tooltip

## Migration Steps

### 1. Install Dependencies
```bash
npm install react-bootstrap bootstrap react-icons
npm uninstall antd @ant-design/icons
```

### 2. Update CSS Imports
Replace:
```javascript
import 'antd/dist/antd.min.css';
```

With:
```javascript
import 'bootstrap/dist/css/bootstrap.min.css';
```

### 3. Component Migration Patterns

#### Button
**Before:**
```javascript
import { Button } from 'antd';
<Button type="primary" onClick={handleClick}>Click</Button>
```

**After:**
```javascript
import { Button } from 'react-bootstrap';
<Button variant="primary" onClick={handleClick}>Click</Button>
```

#### Input
**Before:**
```javascript
import { Input } from 'antd';
<Input placeholder="Enter text" onChange={handleChange} />
```

**After:**
```javascript
import { Form } from 'react-bootstrap';
<Form.Control placeholder="Enter text" onChange={handleChange} />
```

#### Select/Dropdown
**Before:**
```javascript
import { Select } from 'antd';
<Select options={options} onChange={handleChange} />
```

**After:**
```javascript
import { Form } from 'react-bootstrap';
<Form.Select onChange={handleChange}>
  {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
</Form.Select>
```

#### Modal
**Before:**
```javascript
import { Modal } from 'antd';
<Modal visible={isOpen} onOk={handleOk} onCancel={handleCancel}>
  Content
</Modal>
```

**After:**
```javascript
import { Modal, Button } from 'react-bootstrap';
<Modal show={isOpen} onHide={handleCancel}>
  <Modal.Header closeButton>
    <Modal.Title>Title</Modal.Title>
  </Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
    <Button variant="primary" onClick={handleOk}>OK</Button>
  </Modal.Footer>
</Modal>
```

#### Progress
**Before:**
```javascript
import { Progress } from 'antd';
<Progress percent={50} />
```

**After:**
```javascript
import { ProgressBar } from 'react-bootstrap';
<ProgressBar now={50} />
```

#### Dropdown/Menu
**Before:**
```javascript
import { Dropdown, Menu } from 'antd';
<Dropdown overlay={<Menu items={items} />}>
  <Button>Actions</Button>
</Dropdown>
```

**After:**
```javascript
import { Dropdown } from 'react-bootstrap';
<Dropdown>
  <Dropdown.Toggle variant="primary">Actions</Dropdown.Toggle>
  <Dropdown.Menu>
    {items.map(item => <Dropdown.Item key={item.key}>{item.label}</Dropdown.Item>)}
  </Dropdown.Menu>
</Dropdown>
```

#### Icons
**Before:**
```javascript
import { UserOutlined, DownOutlined } from '@ant-design/icons';
<UserOutlined />
```

**After:**
```javascript
import { BsPerson, BsChevronDown } from 'react-icons/bs';
<BsPerson />
```

## Priority Order

1. **High Priority** - Core navigation and layout
   - home.js
   - layout.js
   
2. **Medium Priority** - Main features
   - preview.js
   - chat components
   - command components
   
3. **Lower Priority** - Advanced features
   - video components
   - subsession components

## Testing Checklist

- [ ] All buttons render and click correctly
- [ ] Forms submit properly
- [ ] Modals open/close correctly
- [ ] Dropdowns work
- [ ] Progress bars display
- [ ] Icons render
- [ ] Tooltips show on hover
- [ ] Responsive design maintained
- [ ] Custom styles still apply
