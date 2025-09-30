'use client';

import { useContext } from 'react';
import classNames from 'classnames';
import ZoomContext from '../../../context/zoom-context';
import ZoomMediaContext from '../../../context/media-context';
import CameraButton from './camera';
import MicrophoneButton from './microphone';
import { ScreenShareButton } from './screen-share';
import { LeaveButton } from './leave';
import './video-footer.scss';

const VideoFooter = (props) => {
  const { className, selfShareCanvas, sharing } = props;
  const zmClient = useContext(ZoomContext);
  const { mediaStream } = useContext(ZoomMediaContext);

  const onCameraClick = async () => {
    const isStartedVideo = zmClient.getCurrentUserInfo()?.bVideoOn;
    if (isStartedVideo) {
      await mediaStream?.stopVideo();
    } else {
      await mediaStream?.startVideo({ hd: true });
    }
  };

  const onMicrophoneClick = async () => {
    const currentUser = zmClient.getCurrentUserInfo();
    const isStartedAudio = currentUser && currentUser.audio !== '';
    const isMuted = currentUser?.muted;
    
    if (isStartedAudio) {
      if (isMuted) {
        await mediaStream?.unmuteAudio();
      } else {
        await mediaStream?.muteAudio();
      }
    } else {
      await mediaStream?.startAudio();
    }
  };

  const onMicrophoneMenuClick = async (key) => {
    const [type, deviceId] = key.split('|');
    if (type === 'microphone') {
      await mediaStream?.switchMicrophone(deviceId);
    } else if (type === 'speaker') {
      await mediaStream?.switchSpeaker(deviceId);
    } else if (type === 'leave audio') {
      await mediaStream?.stopAudio();
    }
  };

  const onSwitchCamera = async (deviceId) => {
    await mediaStream?.switchCamera(deviceId);
  };

  const onScreenShareClick = async () => {
    if (sharing) {
      await mediaStream?.stopShareScreen();
    } else {
      await mediaStream?.startShareScreen(selfShareCanvas);
    }
  };

  const onLeaveClick = async () => {
    await zmClient.leave();
  };

  const onEndClick = async () => {
    await zmClient.leave(true);
  };

  const currentUser = zmClient.getCurrentUserInfo();
  const isStartedAudio = currentUser && currentUser.audio !== '';
  const isMuted = !!currentUser?.muted;
  const isStartedVideo = !!currentUser?.bVideoOn;
  const isHost = zmClient.isHost();

  return (
    <div className={classNames('video-footer', className)}>
      <MicrophoneButton
        isStartedAudio={isStartedAudio}
        isMuted={isMuted}
        onMicrophoneClick={onMicrophoneClick}
        onMicrophoneMenuClick={onMicrophoneMenuClick}
        microphoneList={mediaStream?.getMicList()}
        speakerList={mediaStream?.getSpeakerList()}
        activeMicrophone={mediaStream?.getActiveMicrophone()}
        activeSpeaker={mediaStream?.getActiveSpeaker()}
      />
      <CameraButton
        isStartedVideo={isStartedVideo}
        onCameraClick={onCameraClick}
        onSwitchCamera={onSwitchCamera}
        cameraList={mediaStream?.getCameraList()}
        activeCamera={mediaStream?.getActiveCamera()}
      />
      <ScreenShareButton
        sharePrivilege={1}
        isHostOrManager={isHost}
        onScreenShareClick={onScreenShareClick}
      />
      <LeaveButton
        onLeaveClick={onLeaveClick}
        onEndClick={onEndClick}
        isHost={isHost}
      />
    </div>
  );
};

export default VideoFooter;
