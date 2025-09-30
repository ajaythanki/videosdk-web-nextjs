'use client';

import { useContext, useMemo } from 'react';
import { Button, Tooltip, Dropdown } from 'react-bootstrap';
import { 
  BsCheck, 
  BsChevronUp, 
  BsCameraVideo, 
  BsCameraVideoOff,
  BsArrowRepeat,
  BsGrid3X3Gap,
  BsBarChartLine
} from 'react-icons/bs';
import ZoomMediaContext from '../../../context/media-context';
import classNames from 'classnames';

const videoPlaybacks = [
  { title: 'ZOOM ZWA', url: 'https://source.zoom.us/brand/mp4/Using%20the%20Zoom%20PWA.mp4' },
  { title: 'ZOOM Cares', url: 'https://source.zoom.us/brand/mp4/Zoom%20Cares%20Nonprofit%20Impact.mp4' },
  {
    title: 'ZOOM One',
    url: 'https://source.zoom.us/brand/mp4/Zoom%20One%20-%20Team%20Chat%2C%20Phone%2C%20Email%2C%20and%20more.mp4'
  }
];

const videoProcessor = [
  {
    url: `${typeof window !== 'undefined' ? window.location.origin : ''}/static/processors/watermark-processor.js`,
    type: 'video',
    name: 'watermark-processor',
    options: {}
  }
];

const CameraButton = (props) => {
  const {
    isStartedVideo,
    className,
    cameraList = [],
    activeCamera,
    isMirrored = false,
    isBlur = false,
    isPreview = false,
    activePlaybackUrl,
    onCameraClick,
    onSwitchCamera,
    onMirrorVideo,
    onVideoStatistic,
    onBlurBackground,
    onSelectVideoPlayback,
    onSelectVideoProcessor,
    activeProcessor,
    isSupportVideoProcessor = false
  } = props;
  
  const { mediaStream } = useContext(ZoomMediaContext);
  
  const handleMenuItemClick = (key) => {
    const processor = videoProcessor.find((item) => item.name === key);
    if (key === 'mirror') {
      onMirrorVideo?.();
    } else if (key === 'statistic') {
      onVideoStatistic?.();
    } else if (key === 'blur') {
      onBlurBackground?.();
    } else if (key?.startsWith('http')) {
      onSelectVideoPlayback?.(key);
    } else if (processor) {
      onSelectVideoProcessor?.(processor);
    } else {
      onSwitchCamera?.(key);
    }
  };

  const renderMenuItems = useMemo(() => {
    if (!cameraList?.length) return null;

    const items = [];

    // Camera selection
    if (cameraList.length > 0) {
      items.push(
        <div key="camera-header" className="dropdown-header">Select a Camera</div>,
        ...cameraList.map((item) => (
          <Dropdown.Item 
            key={`camera-${item.deviceId}`}
            onClick={() => handleMenuItemClick(item.deviceId)}
            className="d-flex justify-content-between align-items-center"
          >
            {item.label}
            {item.deviceId === activeCamera && <BsCheck />}
          </Dropdown.Item>
        )),
        <Dropdown.Divider key="camera-divider" />
      );
    }

    // Video playback
    if (!isPreview) {
      items.push(
        <div key="playback-header" className="dropdown-header">Select a Video Playback</div>,
        ...videoPlaybacks.map((item) => (
          <Dropdown.Item 
            key={`playback-${item.url}`}
            onClick={() => handleMenuItemClick(item.url)}
            className="d-flex justify-content-between align-items-center"
          >
            {item.title}
            {item.url === activePlaybackUrl && <BsCheck />}
          </Dropdown.Item>
        )),
        <Dropdown.Divider key="playback-divider" />
      );
    }

    // Video processor
    if (!isPreview && isSupportVideoProcessor && videoProcessor?.length > 0) {
      items.push(
        <div key="processor-header" className="dropdown-header">Select a Video Processor</div>,
        ...videoProcessor.map((item) => (
          <Dropdown.Item 
            key={`processor-${item.name}`}
            onClick={() => handleMenuItemClick(item.name)}
            className="d-flex justify-content-between align-items-center"
          >
            {item.name}
            {item.name === activeProcessor && <BsCheck />}
          </Dropdown.Item>
        )),
        <Dropdown.Divider key="processor-divider" />
      );
    }

    // Mirror and background options
    if (!isPreview) {
      items.push(
        <Dropdown.Item 
          key="mirror" 
          onClick={() => handleMenuItemClick('mirror')}
          className="d-flex justify-content-between align-items-center"
        >
          <div className="d-flex align-items-center">
            <BsArrowRepeat className="me-2" />
            Mirror My Video
          </div>
          {isMirrored && <BsCheck />}
        </Dropdown.Item>,
        <Dropdown.Item 
          key="blur" 
          onClick={() => handleMenuItemClick('blur')}
          className="d-flex justify-content-between align-items-center"
        >
          <div className="d-flex align-items-center">
            <BsGrid3X3Gap className="me-2" />
            {mediaStream?.isSupportVirtualBackground() ? 'Blur My Background' : 'Mask My Background'}
          </div>
          {isBlur && <BsCheck />}
        </Dropdown.Item>,
        <Dropdown.Divider key="options-divider" />
      );
    }

    // Video statistic
    if (!isPreview) {
      items.push(
        <Dropdown.Item 
          key="statistic" 
          onClick={() => handleMenuItemClick('statistic')}
          className="d-flex align-items-center"
        >
          <BsBarChartLine className="me-2" />
          Video Statistic
        </Dropdown.Item>
      );
    }

    return items;
  }, [cameraList, activeCamera, isPreview, activePlaybackUrl, isSupportVideoProcessor, activeProcessor, isMirrored, isBlur, mediaStream]);

  const renderButtonContent = useMemo(() => (
    <div className="d-flex align-items-center">
      {isStartedVideo ? <BsCameraVideo /> : <BsCameraVideoOff />}
      {isStartedVideo && <BsChevronUp className="ms-1" size={12} />}
    </div>
  ), [isStartedVideo]);
    
  return (
    <div className={classNames('camera-footer', className)}>
      {isStartedVideo ? (
        <Dropdown color='primary' drop="up" align="end">
          <Tooltip title={isStartedVideo ? 'Stop camera' : 'Start camera'} placement="top">
            <Dropdown.Toggle
              as={Button}
              variant="light"
              className={classNames('vc-button', 'p-2', 'd-flex', 'align-items-center', 'justify-content-center', {
                'started-video': isStartedVideo,
                'disabled': props.disabled
              })}
              onClick={onCameraClick}
              disabled={props.disabled}
              style={{ width: '20px', height: '20px' }}
            >
              {renderButtonContent}
            </Dropdown.Toggle>
          </Tooltip>
          {renderMenuItems && (
            <Dropdown.Menu className="dropdown-menu-end">
              {renderMenuItems}
            </Dropdown.Menu>
          )}
        </Dropdown>
      ) : (
        <Tooltip title="Start camera" placement="top">
          <Button
            variant="light"
            className={classNames('vc-button', 'p-2', 'd-flex', 'align-items-center', 'justify-content-center', {
              'start-video': !isStartedVideo,
              'disabled': props.disabled
            })}
            onClick={onCameraClick}
            disabled={props.disabled}
            style={{ width: '40px', height: '40px' }}
          >
            {renderButtonContent}
          </Button>
        </Tooltip>
      )}
    </div>
  );
};

export default CameraButton;
