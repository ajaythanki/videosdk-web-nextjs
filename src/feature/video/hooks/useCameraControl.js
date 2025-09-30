import { useCallback, useEffect, useState, useContext } from 'react';
import { Modal, Toast } from 'react-bootstrap';
import produce from 'immer';
import { CameraControlCmd } from '@zoom/videosdk';
import AvatarActionContext from '../context/avatar-context';

export function useCameraControl(zmClient, mediaStream) {
  const [isInControl, setIsInControl] = useState(false);
  const [controllingUserId, setControllingUserId] = useState(0);
  const [currentControlledUser, setCurrentControlledUser] = useState({
    userId: 0,
    displayName: ''
  });
  const [cameraCapability, setCameraCapability] = useState([]);
  const {
    dispatch,
    avatarActionState: { isControllingRemoteCamera }
  } = useContext(AvatarActionContext);
  
  const onReceiveFarEndControl = useCallback(
    ({ userId, displayName, currentControllingUserId, currentControllingDisplayName }) => {
      let msg = `${displayName} request to control your camera?`;
      if (currentControllingUserId !== undefined) {
        msg = `${displayName} want to take over the control of ${currentControllingDisplayName}?`;
      }
      Modal.confirm({
        title: 'Camera control',
        content: msg,
        onOk: async () => {
          await mediaStream?.approveFarEndCameraControl(userId);
          setIsInControl(true);
        },
        onCancel: () => {
          mediaStream?.declineFarEndCameraControl(userId);
          setIsInControl(false);
        },
        okText: 'Approve',
        cancelText: 'Decline'
      });
    },
    [mediaStream]
  );
  
  const onReceiveFarEndControlResponse = useCallback(
    ({ isApproved, userId, displayName }) => {
      dispatch({ type: 'set-is-controlling-remote-camera', payload: isApproved });
      if (isApproved) {
        setCurrentControlledUser({ userId, displayName });
        console.log(`You can control ${displayName}'s camera now.`);
      } else {
        setCurrentControlledUser({ userId: 0, displayName: '' });
        console.warn(`${displayName} rejected your control request.`);
      }
    },
    [dispatch]
  );

  const onCameraInControlChange = useCallback(({ isControlled, userId }) => {
    if (isControlled) {
      console.log('Your camera is controlled by other one');
    } else {
      console.log('You can control your camera now.');
    }
    setIsInControl(isControlled);
    setControllingUserId(userId);
  }, []);
  
  const onCameraCapabilityChange = useCallback(({ userId, ptz }) => {
    setCameraCapability(
      produce((draft) => {
        const item = draft.find((i) => i.userId === userId);
        if (item) {
          item.ptz = ptz;
        } else {
          draft.push({ userId, ptz });
        }
      })
    );
  }, []);

  useEffect(() => {
    zmClient.on('far-end-camera-request-control', onReceiveFarEndControl);
    zmClient.on('far-end-camera-response-control', onReceiveFarEndControlResponse);
    zmClient.on('camera-in-control-change', onCameraInControlChange);
    zmClient.on('camera-capability-change', onCameraCapabilityChange);
    return () => {
      zmClient.off('far-end-camera-request-control', onReceiveFarEndControl);
      zmClient.off('far-end-camera-response-control', onReceiveFarEndControlResponse);
      zmClient.off('camera-in-control-change', onCameraInControlChange);
      zmClient.off('camera-capability-change', onCameraCapabilityChange);
    };
  }, [zmClient, onReceiveFarEndControl, onReceiveFarEndControlResponse, onCameraInControlChange, onCameraCapabilityChange]);

  const stopControl = useCallback(() => {
    if (isControllingRemoteCamera) {
      mediaStream?.giveUpFarEndCameraControl(currentControlledUser.userId);
      dispatch({ type: 'set-is-controlling-remote-camera', payload: false });
      setCurrentControlledUser({ userId: 0, displayName: '' });
    }
  }, [isControllingRemoteCamera, mediaStream, currentControlledUser, dispatch]);

  const turnLeft = useCallback(
    (range = 5) => {
      mediaStream?.controlFarEndCamera(currentControlledUser.userId, CameraControlCmd.Left, range);
    },
    [mediaStream, currentControlledUser]
  );

  const turnRight = useCallback(
    (range = 5) => {
      mediaStream?.controlFarEndCamera(currentControlledUser.userId, CameraControlCmd.Right, range);
    },
    [mediaStream, currentControlledUser]
  );

  const turnUp = useCallback(
    (range = 5) => {
      mediaStream?.controlFarEndCamera(currentControlledUser.userId, CameraControlCmd.Up, range);
    },
    [mediaStream, currentControlledUser]
  );

  const turnDown = useCallback(
    (range = 5) => {
      mediaStream?.controlFarEndCamera(currentControlledUser.userId, CameraControlCmd.Down, range);
    },
    [mediaStream, currentControlledUser]
  );

  const zoomIn = useCallback(
    (range = 5) => {
      mediaStream?.controlFarEndCamera(currentControlledUser.userId, CameraControlCmd.ZoomIn, range);
    },
    [mediaStream, currentControlledUser]
  );

  const zoomOut = useCallback(
    (range = 5) => {
      mediaStream?.controlFarEndCamera(currentControlledUser.userId, CameraControlCmd.ZoomOut, range);
    },
    [mediaStream, currentControlledUser]
  );

  const switchCamera = useCallback(() => {
    mediaStream?.controlFarEndCamera(currentControlledUser.userId, CameraControlCmd.SwitchCamera);
  }, [mediaStream, currentControlledUser]);

  return {
    currentControlledUser,
    isInControl,
    cameraCapability: cameraCapability.find((item) => item.userId === currentControlledUser.userId)?.ptz,
    stopControl,
    turnDown,
    turnRight,
    turnLeft,
    turnUp,
    zoomIn,
    zoomOut,
    switchCamera
  };
}
