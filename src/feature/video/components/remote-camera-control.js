'use client';

import { useState, useEffect, useRef, useContext } from 'react';
import {
  BsChevronDown,
  BsChevronUp,
  BsChevronLeft,
  BsChevronRight,
  BsPlus,
  BsDash,
  BsArrowRepeat
} from 'react-icons/bs';
import { Button, Dropdown } from 'react-bootstrap';
import Draggable from 'react-draggable';
import { usePrevious } from '../../../hooks/index';
import ZoomContext from '../../../context/zoom-context';
import ZoomMediaContext from '../../../context/media-context';
import './remote-camera-control.scss';
import { IconFont } from '../../../component/icon-font';
import { getAntdDropdownMenu, getAntdItem } from './video-footer-utils';
import classNames from 'classnames';
import { useCameraControl } from '../hooks/useCameraControl';
import AvatarContext from '../context/avatar-context';

const RemoteCameraControlIndication = (props) => {
  const { stopCameraControl } = props;
  const menu = [getAntdItem('Stop camera control', 'stop')];
  
  const onMenuItemClick = (payload) => {
    stopCameraControl();
  };
  
  return (
    <Dropdown
      className={classNames('vc-dropdown-button')}
      menu={getAntdDropdownMenu(menu, onMenuItemClick)}
      trigger={['click']}
      placement="bottomRight"
    >
      <Button
        icon={<IconFont type="icon-remote-control" />}
        size="large"
        ghost={true}
        shape="circle"
        className={classNames('vc-button', 'remote-control-dropdown')}
      />
    </Dropdown>
  );
};

const RemoteCameraControlPanel = (props) => {
  const { mediaStream } = useContext(ZoomMediaContext);
  const zmClient = useContext(ZoomContext);
  const {
    avatarActionState: { isControllingRemoteCamera }
  } = useContext(AvatarContext);
  const {
    currentControlledUser,
    isInControl,
    cameraCapability,
    stopControl,
    turnDown,
    turnRight,
    turnLeft,
    turnUp,
    zoomIn,
    zoomOut,
    switchCamera
  } = useCameraControl(zmClient, mediaStream);

  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef(0);
  const draggableRef = useRef(null);
  const controlRef = useRef(undefined);
  const isPreviousPressing = usePrevious(isPressing);
  
  useEffect(() => {
    if (isPressing && !isPreviousPressing) {
      timerRef.current = window.setInterval(() => {
        controlRef.current?.();
      }, 100);
    }
    if (!isPressing && isPreviousPressing) {
      clearInterval(timerRef.current);
    }
  }, [isPressing, isPreviousPressing]);

  if (!isInControl || !currentControlledUser) {
    return isControllingRemoteCamera ? <RemoteCameraControlIndication stopCameraControl={stopControl} /> : null;
  }

  const onMouseDown = (control) => {
    return () => {
      controlRef.current = control;
      setIsPressing(true);
    };
  };

  const onMouseUp = () => {
    controlRef.current = undefined;
    setIsPressing(false);
  };

  return (
    <Draggable nodeRef={draggableRef}>
      <div className="remote-camera-control" ref={draggableRef}>
        <p className="remote-camera-control-title">
          <IconFont type="icon-remote-control" />
          <span>Controlling {currentControlledUser?.displayName}'s Camera</span>
        </p>
        <div className="remote-camera-control-body">
          <div className="remote-camera-control-main">
            <Button
              className="remote-camera-control-btn"
              onMouseDown={onMouseDown(turnUp)}
              onMouseUp={onMouseUp}
              disabled={!cameraCapability?.tilt}
            >
              <BsChevronUp />
            </Button>
            <Button
              className="remote-camera-control-btn"
              onMouseDown={onMouseDown(turnLeft)}
              onMouseUp={onMouseUp}
              disabled={!cameraCapability?.pan}
            >
              <BsChevronLeft />
            </Button>
            <Button
              className="remote-camera-control-btn"
              onMouseDown={onMouseDown(turnRight)}
              onMouseUp={onMouseUp}
              disabled={!cameraCapability?.pan}
            >
              <BsChevronRight />
            </Button>
            <Button
              className="remote-camera-control-btn"
              onMouseDown={onMouseDown(turnDown)}
              onMouseUp={onMouseUp}
              disabled={!cameraCapability?.tilt}
            >
              <BsChevronDown />
            </Button>
          </div>
          <div className="remote-camera-control-side">
            <Button
              className="remote-camera-control-btn"
              onMouseDown={onMouseDown(zoomIn)}
              onMouseUp={onMouseUp}
              disabled={!cameraCapability?.zoom}
            >
              <BsPlus />
            </Button>
            <Button
              className="remote-camera-control-btn"
              onMouseDown={onMouseDown(zoomOut)}
              onMouseUp={onMouseUp}
              disabled={!cameraCapability?.zoom}
            >
              <BsDash />
            </Button>
            <Button
              className="remote-camera-control-btn"
              onClick={switchCamera}
            >
              <BsArrowRepeat />
            </Button>
          </div>
        </div>
        <Button className="remote-camera-control-stop" onClick={stopControl}>
          Give Up Control
        </Button>
      </div>
    </Draggable>
  );
};

export default RemoteCameraControlPanel;
