'use client';

import { useCallback, useState, useRef } from 'react';
import ZoomVideo from '@zoom/videosdk';
import { useMount, useUnmount } from '../../hooks';
import './preview.scss';
import MicrophoneButton from '../video/components/microphone';
import CameraButton from '../video/components/camera';
import { Button, ProgressBar, Form } from 'react-bootstrap';
import classNames from 'classnames';
import { useSearchParams } from 'next/navigation';

let prevMicFeedbackStyle = '';
let micFeedBackInteval;

let localAudio = ZoomVideo.createLocalAudioTrack();
let localVideo = ZoomVideo.createLocalVideoTrack();
let allDevices;

const mountDevices = async () => {
  allDevices = await ZoomVideo.getDevices();
  const cameraDevices = allDevices.filter((device) => {
    return device.kind === 'videoinput';
  });
  const micDevices = allDevices.filter((device) => {
    return device.kind === 'audioinput';
  });
  const speakerDevices = allDevices.filter((device) => {
    return device.kind === 'audiooutput';
  });
  return {
    mics: micDevices.map((item) => {
      return { label: item.label, deviceId: item.deviceId };
    }),
    speakers: speakerDevices.map((item) => {
      return { label: item.label, deviceId: item.deviceId };
    }),
    cameras: cameraDevices.map((item) => {
      return { label: item.label, deviceId: item.deviceId };
    })
  };
};

const updateMicFeedbackStyle = () => {
  const newVolumeIntensity = localAudio.getCurrentVolume();
  let newMicFeedbackStyle = '';

  if (newVolumeIntensity === 0) {
    newMicFeedbackStyle = '';
  } else if (newVolumeIntensity <= 0.05) {
    newMicFeedbackStyle = 'mic-feedback__very-low';
  } else if (newVolumeIntensity <= 0.1) {
    newMicFeedbackStyle = 'mic-feedback__low';
  } else if (newVolumeIntensity <= 0.15) {
    newMicFeedbackStyle = 'mic-feedback__medium';
  } else if (newVolumeIntensity <= 0.2) {
    newMicFeedbackStyle = 'mic-feedback__high';
  } else if (newVolumeIntensity <= 0.25) {
    newMicFeedbackStyle = 'mic-feedback__very-high';
  } else {
    newMicFeedbackStyle = 'mic-feedback__max';
  }
  const micIcon = document.getElementById('auido-volume-feedback');
  if (prevMicFeedbackStyle !== '' && micIcon) {
    micIcon.classList.toggle(prevMicFeedbackStyle);
  }

  if (newMicFeedbackStyle !== '' && micIcon) {
    micIcon.classList.toggle(newMicFeedbackStyle);
  }
  console.log(newMicFeedbackStyle, newVolumeIntensity);
  prevMicFeedbackStyle = newMicFeedbackStyle;
};


const PreviewContainer = () => {
  const searchParams = useSearchParams();
  const isUseVideoPlayer = searchParams.get('useVideoPlayer') === '1';
  const [isStartedAudio, setIsStartedAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isStartedVideo, setIsStartedVideo] = useState(false);
  const [micList, setMicList] = useState([]);
  const [speakerList, setSpeakerList] = useState([]);
  const [cameraList, setCameraList] = useState([]);
  const [activeMicrophone, setActiveMicrophone] = useState('');
  const [activeSpeaker, setActiveSpeaker] = useState('');
  const [activeCamera, setActiveCamera] = useState('');
  const [outputLevel, setOutputLevel] = useState(0);
  const [inputLevel, setInputLevel] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [isInVBMode, setIsInVBMode] = useState(false);
  const [isBlur, setIsBlur] = useState(false);
  const speakerTesterRef = useRef();
  const microphoneTesterRef = useRef();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const videoPlayerRef = useRef(null);

  const onCameraClick = useCallback(async () => {
    if (isStartedVideo) {
      await localVideo?.stop();
      setIsStartedVideo(false);
      setIsInVBMode(false);
      setIsBlur(false);
    } else {
      if (isUseVideoPlayer) {
        if (videoPlayerRef.current) {
          await localVideo?.start(videoPlayerRef.current);
          setIsStartedVideo(true);
        }
      } else {
        if (videoRef.current) {
          await localVideo?.start(videoRef.current);
          setIsStartedVideo(true);
        }
      }
    }
  }, [isStartedVideo, isUseVideoPlayer]);

  const onMicrophoneClick = useCallback(async () => {
    if (isStartedAudio) {
      if (isMuted) {
        await localAudio?.unmute();
        micFeedBackInteval = setInterval(updateMicFeedbackStyle, 500);
        setIsMuted(false);
      } else {
        await localAudio?.mute();
        if (micFeedBackInteval) {
          clearInterval(micFeedBackInteval);
        }
        setIsMuted(true);
      }
    } else {
      await localAudio?.start();
      setIsStartedAudio(true);
    }
  }, [isStartedAudio, isMuted]);

  const onMicrophoneMenuClick = async (key) => {
    const [type, deviceId] = key.split('|');
    if (type === 'microphone') {
      if (deviceId !== activeMicrophone) {
        await localAudio.stop();
        setIsMuted(true);
        localAudio = ZoomVideo.createLocalAudioTrack(deviceId);
        await localAudio.start();
        setActiveMicrophone(deviceId);
      }
    } else if (type === 'leave audio') {
      await localAudio.stop();
      setIsStartedAudio(false);
    }
  };

  const onSwitchCamera = async (key) => {
    if (localVideo) {
      if (activeCamera !== key) {
        await localVideo.switchCamera(key);
        setActiveCamera(key);
      }
    }
  };

  const onSwitchMicrophone = (key) => {
    setActiveMicrophone(key);
    if (speakerTesterRef.current) {
      speakerTesterRef.current.destroy();
      speakerTesterRef.current = undefined;
    }
    if (isRecordingVoice || isPlayingRecording) {
      microphoneTesterRef.current?.stop();
      setIsRecordingVoice(false);
      setIsPlayingRecording(false);
    }
  };

  const onSwitchSpeaker = (key) => {
    setActiveSpeaker(key);
    if (isPlayingAudio) {
      speakerTesterRef.current?.stop();
      setIsPlayingAudio(false);
      setOutputLevel(0);
    }
  };

  const onBlurBackground = useCallback(async () => {
    if (isInVBMode || isUseVideoPlayer) {
      if (isBlur) {
        await localVideo.updateVirtualBackground(undefined);
      } else {
        await localVideo.updateVirtualBackground('blur');
      }
      setIsBlur(!isBlur);
    } else {
      if (!isBlur) {
        await localVideo.stop();
        if (canvasRef.current) {
          localVideo.start(canvasRef.current, { imageUrl: 'blur' });
        }
        setIsInVBMode(true);
        setIsBlur(!isBlur);
      }
    }
  }, [isInVBMode, isBlur, isUseVideoPlayer]);

  useMount(() => {
    mountDevices().then((devices) => {
      setMicList(devices.mics);
      setCameraList(devices.cameras);
      setSpeakerList(devices.speakers);
      if (devices.speakers.length > 0) {
        setActiveSpeaker(devices.speakers[0].deviceId);
      }
      if (devices.mics.length > 0) {
        setActiveMicrophone(devices.mics[0].deviceId);
      }
    });
  });

  const onTestSpeakerClick = () => {
    if (microphoneTesterRef.current) {
      microphoneTesterRef.current.destroy();
      microphoneTesterRef.current = undefined;
      setIsRecordingVoice(false);
      setIsPlayingRecording(false);
    }
    if (isPlayingAudio) {
      speakerTesterRef.current?.stop();
      setIsPlayingAudio(false);
      setOutputLevel(0);
    } else {
      speakerTesterRef.current = localAudio.testSpeaker({
        speakerId: activeSpeaker,
        onAnalyseFrequency: (value) => {
          setOutputLevel(Math.min(100, value));
        }
      });
      setIsPlayingAudio(true);
    }
  };

  const onTestMicrophoneClick = () => {
    if (speakerTesterRef.current) {
      speakerTesterRef.current.destroy();
      speakerTesterRef.current = undefined;
      setIsPlayingAudio(false);
    }
    if (!isPlayingRecording && !isRecordingVoice) {
      if (microphoneTesterRef.current && microphoneTesterRef.current?.stop) {
        microphoneTesterRef.current.stop();
        microphoneTesterRef.current.destroy();
      }
      microphoneTesterRef.current = localAudio.testMicrophone({
        microphoneId: activeMicrophone,
        speakerId: activeSpeaker,
        recordAndPlay: true,
        onAnalyseFrequency: (value) => {
          setInputLevel(Math.min(100, value));
        },
        onStartRecording: () => {
          setIsRecordingVoice(true);
        },
        onStartPlayRecording: () => {
          setIsRecordingVoice(false);
          setIsPlayingRecording(true);
        },
        onStopPlayRecording: () => {
          setIsPlayingRecording(false);
        }
      });
    } else if (isRecordingVoice) {
      microphoneTesterRef.current?.stopRecording();
      setIsRecordingVoice(false);
    } else if (isPlayingRecording) {
      microphoneTesterRef.current?.stop();
      setIsPlayingRecording(false);
    }
  };

  let microphoneBtn = 'Test Microphone';
  if (isRecordingVoice) {
    microphoneBtn = 'Recording';
  } else if (isPlayingRecording) {
    microphoneBtn = 'Playing';
  }

  useUnmount(() => {
    if (isStartedAudio) {
      localAudio.stop();
    }
    if (isStartedVideo) {
      localVideo.stop();
    }
  });

  return (
    <div className="js-preview-view">
      <div id="js-preview-view" className="container preview__root">
        <span>
          <h1>Audio And Video Preview</h1>
        </span>
        <div className="container video-app">
          <div className="preview-video">
            <video
              className={classNames({ 'preview-video-show': !isInVBMode })}
              muted={true}
              playsInline
              ref={videoRef}
            />
            {isUseVideoPlayer ? (
              <video-player-container className="video-player-container">
                <video-player
                  ref={videoPlayerRef}
                  className={classNames({ 'preview-video-show': isInVBMode })}
                />
              </video-player-container>
            ) : (
              <canvas
                className={classNames({ 'preview-video-show': isInVBMode })}
                width="1280"
                height="720"
                ref={canvasRef}
              />
            )}
          </div>
          <div className="video-footer video-operations video-operations-preview">
            <div>
              <MicrophoneButton
                isStartedAudio={isStartedAudio}
                isMuted={isMuted}
                onMicrophoneClick={onMicrophoneClick}
                onMicrophoneMenuClick={onMicrophoneMenuClick}
                activeMicrophone={activeMicrophone}
                activeSpeaker={activeSpeaker}
              />
              <CameraButton
                isStartedVideo={isStartedVideo}
                onCameraClick={onCameraClick}
                onSwitchCamera={onSwitchCamera}
                onBlurBackground={onBlurBackground}
                cameraList={cameraList}
                activeCamera={activeCamera}
                isBlur={isBlur}
                isPreview={true}
              />
            </div>
          </div>
        </div>
        <div className="audio-test">
          <div className="audio-test-wrap">
            <h3>Speaker Test</h3>
            <div className="speaker-action">
              <Button variant="primary" onClick={onTestSpeakerClick} className="speaker-btn">
                {isPlayingAudio ? 'Stop' : 'Test Speaker'}
              </Button>
              <Form.Select
                value={activeCamera}
                onChange={(e) => onCameraChange(e.target.value)}
              >
                {cameraList.map((item) => (
                  <option key={item.deviceId} value={item.deviceId}>
                    {item.label}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="speaker-output">
              <span className="speaker-label">Output level</span>
              <ProgressBar now={outputLevel} />
            </div>
          </div>
          <div className="audio-test-wrap">
            <h3>Microphone Test</h3>
            <div className="speaker-action">
              <Button variant="primary" onClick={onTestMicrophoneClick} className="speaker-btn">
                {microphoneBtn}
              </Button>
              <Form.Select
                value={activeMicrophone}
                onChange={(e) => onMicrophoneChange(e.target.value)}
              >
                {micList.map((item) => (
                  <option key={item.deviceId} value={item.deviceId}>
                    {item.label}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="speaker-output">
              <span className="speaker-label">Input level</span>
              <ProgressBar now={inputLevel} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewContainer;
