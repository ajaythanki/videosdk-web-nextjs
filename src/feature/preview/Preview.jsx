'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BsCameraVideoOffFill, BsFillCameraVideoOffFill } from 'react-icons/bs';
import { BsCameraVideoFill } from 'react-icons/bs';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { RiUserVoiceFill } from 'react-icons/ri';
import { RxSpeakerLoud } from 'react-icons/rx';
import { IoSettings } from 'react-icons/io5';
import { MdOutlineArrowForwardIos } from 'react-icons/md';
import Settings from './Settings';
import './preview.css';
import { useRouter, useSearchParams } from 'next/navigation';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';

import { toast } from 'react-toastify';
import audiowave from '../../../public/image/audio_wave.gif';
import Image from 'next/image';
import Swal from 'sweetalert2';
import { useWebSocket } from 'app/context/WebSocketContext';
import { Alert, Modal } from 'react-bootstrap';
import Loading from 'components/loader/Loader';
import WaitingLobby from 'components/waitingLobby/WaitingLobby';
import { debounce } from 'lodash';
import { useSession } from 'next-auth/react';
import moment from 'moment-timezone';
import { useZoom } from 'context/ZoomContext';

function isExpiredInTimezone(expirationTime, timezone = 'Asia/Kolkata') {
  const now = moment().tz(timezone);
  const expiry = moment.tz(expirationTime, timezone);
  return now.isAfter(expiry);
}

export const VB_BACKGROUNDS = [
  {
    id: 'default',
    url: 'https://plus.unsplash.com/premium_photo-1668708034541-4ba9a33fae3a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    name: 'Default',
  },
  {
    id: 'white-interior',
    url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    name: 'White Interior',
  },
  {
    id: 'window-plants',
    url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2067&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    name: 'Window Plants',
  },
  {
    id: 'cozy-workspace',
    url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    name: 'Cozy Workspace',
  },
  {
    id: 'modern-workspace',
    url: 'https://images.unsplash.com/photo-1558882224-dda166733046?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    name: 'Modern Workspace',
  },
  {
    id: 'gradient-blue',
    url: 'https://images.unsplash.com/photo-1579488083677-ac53dcf66911?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    name: 'Gradient Blue',
  },
  {
    id: 'dark-geometry',
    url: 'https://images.unsplash.com/photo-1666548035757-bf13f58d1635?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    name: 'Dark Geometry',
  },
  {
    id: 'abstract-light',
    url: 'https://images.unsplash.com/photo-1707588883437-9b3709880e3b?q=80&w=1936&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    name: 'Abstract Light',
  },
  {
    id: 'blur',
    url: 'blur',
    name: 'Blur Background',
    isBlur: true,
  },
  {
    id: 'none',
    url: null,
    name: 'No Background',
  },
];

const Preview = () => {
  const router = useRouter();
  const [volume, setVolume] = useState(50);
  const [loading, setLoading] = useState(true);
  const [joinProcessing, setJoinProcessing] = useState(false);
  const [backgroundOption, setBackgroundOption] = useState('none');
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isMikeChecked, setIsMikeChecked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [microphoneTester, setMicrophoneTester] = useState(null);
  const [speakerTester, setSpeakerTester] = useState(null);
  const [inputLevel, setInputLevel] = useState(0);
  const [outputLevel, setOutputLevel] = useState(0);
  const [cameraDevices, setCameraDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [speakerDevices, setSpeakerDevices] = useState([]);
  const [selectedCameraIndex, setSelectedCameraIndex] = useState('0');
  const [selectedMikeIndex, setSelectedMikeIndex] = useState('0');
  const [selectedSpeakerIndex, setSelectedSpeakerIndex] = useState('0');
  const [meetingStatusModalShow, setMeetingStatusModalShow] = useState(false);
  const [meetingStatus, setMeetingStatus] = useState('');
  const [isXLargeScreen, setIsXLargeScreen] = useState(false);
  const [stream, setStream] = useState(null);
  const [meetingSessionData, setMeetingSessionData] = useState({});
  const [waitingLobbyPresent, setWaitingLobbyPresent] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState({
    camera: null,
    microphone: null,
  });
  const [permissionAlert, setPermissionAlert] = useState('');
  const { data: session } = useSession();
  const timeZone = session?.user?.timezone || 'Asia/Kolkata';

  const ZoomVideoRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const axiosAuth = useAxiosAuth();
  const searchParams = useSearchParams();
  const sessionID = searchParams.get('sessionID');
  const userName = searchParams.get('userName');
  let appointmentId = searchParams.get('appointmentId');
  let patientEmail = searchParams.get('patientEmail');

  const { loadZoomSDK } = useZoom();

  if (typeof window !== 'undefined') {
    localStorage.setItem('patientLeaveSession', 'false');
    localStorage.setItem('doctorEndSession', 'false');
  }
  const socket = useWebSocket();
  const [hasToastBeenShown, setHasToastBeenShown] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hasToastBeenShown') === true;
    }
    return false;
  });

  useEffect(() => {
    // if (!socket) {
    //   return;
    // }

    if (socket && socket.connected) {
      console.log('Socket is ready:', socket);

      console.log('WebSocket connected on Preview Page');

      socket?.on('message', msg => {
        const message = JSON.parse(msg);
        console.log('message==', message);
        if (message.type === 'waiting') {
          setWaitingLobbyPresent(true);
        }
      });

      socket?.on('disconnect', () => {
        console.log('WebSocket disconnected on Preview Page');
      });

      // Clean up when component unmounts
      return () => {
        socket.off('connect');
        socket.off('message');
        socket.off('disconnect');
      };
    }
  }, [socket]);

  const handleVolumeChange = value => {
    setVolume(value);

    // Update audio player volume if it exists
    const audioPlayer = document.getElementById('audioPlayer');
    if (audioPlayer) {
      audioPlayer.volume = value / 100;
    }
  };

  const handleSettingsClick = status => {
    setIsSettingsVisible(status);
  };
  
  useEffect(() => {
    // handle background change requests from Settings
    window.onBackgroundChanged = async options => {
      if (!ZoomVideoRef.current || !localVideoTrack || !isVideoOn) return;

      try {
        // Stop current track (ignore stop errors)
        await localVideoTrack.stop().catch(() => {});

        // mark video off while we recreate
        setIsVideoOn(false);

        // small delay for SDK cleanup
        await new Promise(resolve => setTimeout(resolve, 200));

        // find currently selected camera device id (fallback to default)
        const camIndex = parseInt(selectedCameraIndex || '0');
        const deviceId = cameraDevices[camIndex]?.deviceId;

        // create a fresh track so background processing is attached to a new source
        const newTrack = deviceId
          ? ZoomVideoRef.current.createLocalVideoTrack(deviceId)
          : ZoomVideoRef.current.createLocalVideoTrack();
        setLocalVideoTrack(newTrack);

        // recreate preview DOM node so SDK attaches to a clean element
        const oldEl = document.getElementById('local-preview-video');
        if (oldEl) {
          const container = oldEl.parentElement;
          if (container) {
            container.innerHTML = '';
            const newVideoPlayer = document.createElement('video-player');
            newVideoPlayer.id = 'local-preview-video';
            container.appendChild(newVideoPlayer);
            // slight delay to ensure DOM ready
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        const targetEl = document.getElementById('local-preview-video');
        if (targetEl) {
          // start new track with supplied options (virtual background)
          await newTrack.start(targetEl, options).catch(() => {});
        } else {
          // if no target element, still start track so it's active
          await newTrack.start?.().catch(() => {});
        }

        setIsVideoOn(true);
        localStorage.setItem('isVideoOn', 'true');
      } catch (err) {
        // user-facing fallback without noisy logs
        toast.error(
          'Failed to apply background. Please try turning video off and on again.'
        );
      }
    };

    return () => {
      delete window.onBackgroundChanged;
    };
  }, [
    ZoomVideoRef,
    localVideoTrack,
    isVideoOn,
    cameraDevices,
    selectedCameraIndex,
  ]);

  const toggleVideo = async () => {
    try {
      if (isVideoOn) {
        // Turn off video
        await localVideoTrack.stop();
        setIsVideoOn(false);
        localStorage.setItem('isVideoOn', 'false');
      } else {
        // Get saved background selection and options
        const savedBackground =
          localStorage.getItem('zoom_virtual_background_selection') || 'none';
        let options = {};

        if (savedBackground === 'blur') {
          options = { imageUrl: 'blur' };
        } else if (savedBackground !== 'none') {
          // Find the background from VB_BACKGROUNDS
          const selectedBg = VB_BACKGROUNDS.find(
            bg => bg.id === savedBackground
          );
          if (selectedBg && selectedBg.url) {
            options = { imageUrl: selectedBg.url };
          }
        }

        console.log(
          'Starting video with background:',
          savedBackground,
          'options:',
          options
        );

        // Get the video element
        const videoElement = document.getElementById('local-preview-video');
        if (videoElement && localVideoTrack) {
          // Clear and recreate the video element
          const videoPlayerContainer = videoElement.parentElement;
          if (videoPlayerContainer) {
            videoPlayerContainer.innerHTML = '';

            const newVideoPlayer = document.createElement('video-player');
            newVideoPlayer.id = 'local-preview-video';
            videoPlayerContainer.appendChild(newVideoPlayer);

            // Small delay to ensure DOM is ready
            await new Promise(resolve => setTimeout(resolve, 100));

            const newVideoElement = document.getElementById(
              'local-preview-video'
            );

            // Start video with appropriate options
            if (savedBackground === 'none') {
              await localVideoTrack.start(newVideoElement);
            } else {
              await localVideoTrack.start(newVideoElement, options);
            }
          }

          setIsVideoOn(true);
          localStorage.setItem('isVideoOn', 'true');
        }
      }
    } catch (error) {
      console.error('Error toggling video:', error);
      toast.error('Failed to toggle video. Please try again.');
    }
  };

  // Toggle audio on/off
  const toggleAudio = useCallback(async () => {
    if (localAudioTrack) {
      if (isAudioOn) {
        try {
          await localAudioTrack.mute();
          setIsAudioOn(false);

          // Clear microphone tester if active
          if (microphoneTester) {
            clearInterval(microphoneTester);
            setInputLevel(0);
            setMicrophoneTester(null);
          }

          if (typeof window !== 'undefined') {
            localStorage.setItem('isAudioOn', 'false');
          }
        } catch (error) {
          console.error('Error muting audio track:', error);
        }
      } else {
        try {
          await localAudioTrack.unmute();
          setIsAudioOn(true);

          if (typeof window !== 'undefined') {
            localStorage.setItem('isAudioOn', 'true');
          }
        } catch (error) {
          console.error('Error unmuting audio track:', error);
        }
      }
    } else {
      console.error('Local audio track is not initialized.');
    }
  }, [isAudioOn, localAudioTrack, microphoneTester]);

  // Handle microphone test using Zoom SDK
  const handleTestMike = async e => {
    if (!isAudioOn) {
      toast.error('Please turn on the mike.');
      return;
    }

    setIsMikeChecked(e.target.checked);

    if (e.target.checked) {
      if (localAudioTrack && ZoomVideoRef.current) {
        try {
          console.log('Available audio devices:', audioDevices);
          console.log('Selected microphone index:', selectedMikeIndex);
          console.log('Selected device:', audioDevices[selectedMikeIndex]);

          const tester = localAudioTrack.testMicrophone({
            microphoneId: audioDevices[selectedMikeIndex].deviceId,
            onAnalyseFrequency: v => {
              setInputLevel(v);
            },
          });

          setMicrophoneTester(tester);
        } catch (error) {
          console.error('Error testing microphone:', error);
          toast.error('Failed to test microphone');
        }
      }
    } else {
      // Stop microphone test
      if (microphoneTester) {
        microphoneTester.stop();
        setMicrophoneTester(null);
        setInputLevel(0);
      }
    }
  };

  // Handle speaker test using Zoom SDK
  const handleTestSpeaker = () => {
    if (isPlaying) {
      // Stop speaker test
      if (speakerTester) {
        speakerTester.destroy();
        setSpeakerTester(null);
        setOutputLevel(0);
      }
      setIsPlaying(false);
    } else {
      // Start speaker test
      if (localAudioTrack && ZoomVideoRef.current) {
        try {
          const tester = localAudioTrack.testSpeaker({
            speakerId: speakerDevices[selectedSpeakerIndex]?.deviceId,
            onAnalyseFrequency: v => {
              setOutputLevel(v);
            },
          });

          setSpeakerTester(tester);
          setIsPlaying(true);
        } catch (error) {
          console.error('Error testing speaker:', error);
          toast.error('Failed to test speaker');

          // Fallback to audio element if SDK speaker test fails
          const audioPlayer = document.getElementById('audioPlayer');
          if (audioPlayer) {
            audioPlayer.play();
            setIsPlaying(true);
          }
        }
      } else {
        // Fallback to audio element
        const audioPlayer = document.getElementById('audioPlayer');
        if (audioPlayer) {
          audioPlayer.play();
          setIsPlaying(true);
        }
      }
    }
  };

  // Initialize Zoom Video SDK and devices
  useEffect(() => {
    const initializeZoomSDK = async () => {
      try {
        // Check camera and microphone permissions
        const cameraPermission = await navigator.permissions.query({
          name: 'camera',
        });
        const microphonePermission = await navigator.permissions.query({
          name: 'microphone',
        });

        if (
          cameraPermission.state === 'denied' &&
          microphonePermission.state === 'denied'
        ) {
          setPermissionGranted({
            camera: false,
            microphone: false,
          });
          setPermissionAlert(
            'Access to both camera and microphone is denied. Please enable them in your browser settings.'
          );
        } else if (cameraPermission.state === 'denied') {
          setPermissionGranted(prev => ({
            ...prev,
            camera: false,
          }));
          setPermissionAlert(
            'Camera access is denied. Please enable it in your browser settings.'
          );
        } else if (microphonePermission.state === 'denied') {
          setPermissionGranted(prev => ({
            ...prev,
            microphone: false,
          }));
          setPermissionAlert(
            'Microphone access is denied. Please enable it in your browser settings.'
          );
        } else {
          // Permissions granted
          setPermissionGranted({
            camera: true,
            microphone: true,
          });

          setPermissionAlert('');
        }

        const ZoomVideoModule = await loadZoomSDK();
        console.log(ZoomVideoModule, 'ZoomVideoModule (from context)');
        ZoomVideoRef.current = ZoomVideoModule;

        // Initialize the Zoom client
        const client = ZoomVideoModule.createClient();
        const mediaStream = client.getMediaStream();
        setStream(mediaStream);

        await client.init('en-US', 'Global', { patchJsMedia: true });

        const devices = await ZoomVideoModule.getDevices();

        let videoDevices = devices.filter(
          device => device.kind === 'videoinput'
        );
        let audioInputDevices = devices.filter(
          device => device.kind === 'audioinput'
        );
        let audioOutputDevices = devices.filter(
          device => device.kind === 'audiooutput'
        );

        // Handle mobile devices
        const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(
          navigator.userAgent
        );
        if (videoDevices.length && isMobileDevice) {
          videoDevices = [
            { label: 'Front Camera', deviceId: 'user' },
            { label: 'Back Camera', deviceId: 'environment' },
          ];
        }
        console.log(videoDevices, 'videoDevices');

        setCameraDevices(videoDevices);
        setAudioDevices(audioInputDevices);
        setSpeakerDevices(audioOutputDevices);

        // Create video track
        const camIndex = parseInt(selectedCameraIndex);
        const videoTrack = ZoomVideoModule.createLocalVideoTrack(
          videoDevices[camIndex].deviceId
        );
        console.log(videoTrack, 'videoTrack');
        setLocalVideoTrack(videoTrack);

        // Create audio track
        const mikeIndex = parseInt(selectedMikeIndex);
        const audioTrack = ZoomVideoModule.createLocalAudioTrack(
          audioInputDevices[mikeIndex].deviceId
        );
        setLocalAudioTrack(audioTrack);

        // Start audio track
        await audioTrack.start();

        // Set up device change detection
        navigator.mediaDevices.ondevicechange = async () => {
          const updatedDevices = await ZoomVideoModule.getDevices();

          setCameraDevices(
            updatedDevices.filter(device => device.kind === 'videoinput')
          );
          setAudioDevices(
            updatedDevices.filter(device => device.kind === 'audioinput')
          );
          setSpeakerDevices(
            updatedDevices.filter(device => device.kind === 'audiooutput')
          );
        };

        setLoading(false);
      } catch (error) {
        console.log('Error initializing Zoom SDK:', error);
        setLoading(false);
      }
    };

    initializeZoomSDK();

    return () => {
      const cleanup = async () => {
        if (localVideoTrack) {
          try {
            await localVideoTrack.stop();
          } catch (err) {
            console.error('Error stopping video track in cleanup:', err);
          }
        }

        if (localAudioTrack) {
          try {
            await localAudioTrack.stop();
          } catch (err) {
            console.error('Error stopping audio track in cleanup:', err);
          }
        }

        if (microphoneTester) {
          try {
            microphoneTester.stop();
          } catch (err) {
            console.error('Error stopping microphone tester:', err);
          }
        }
        if (speakerTester) {
          try {
            speakerTester.destroy();
          } catch (err) {
            console.error('Error destroying speaker tester:', err);
          }
        }

        // Remove device change listener
        if (navigator.mediaDevices && navigator.mediaDevices.ondevicechange) {
          navigator.mediaDevices.ondevicechange = null;
        }

        // Clear the window handler
        if (window.onBackgroundChanged) {
          delete window.onBackgroundChanged;
        }
      };

      cleanup();
    };
  }, []);

  useEffect(() => {
    const updateDevices = async () => {
      if (!ZoomVideoRef.current || loading) return;

      // VIDEO handling
      const camIndex = parseInt(selectedCameraIndex);
      const deviceId = cameraDevices[camIndex]?.deviceId;
      if (deviceId) {
        if (isVideoOn) {
          if (localVideoTrack) {
            try {
              if (typeof localVideoTrack.switchCamera === 'function') {
                await localVideoTrack.switchCamera(deviceId);
                // ensure preview is started in case it was stopped
                const el = document.getElementById('local-preview-video');
                if (el && typeof localVideoTrack.start === 'function') {
                  const options =
                    backgroundOption === 'blur' ? { imageUrl: 'blur' } : {};
                  await localVideoTrack.start(el, options).catch(() => {});
                }
              } else {
                // fallback: stop + recreate
                await localVideoTrack.stop().catch(() => {});
                const newTrack =
                  ZoomVideoRef.current.createLocalVideoTrack(deviceId);
                setLocalVideoTrack(newTrack);
                const el = document.getElementById('local-preview-video');
                if (el) {
                  const options =
                    backgroundOption === 'blur' ? { imageUrl: 'blur' } : {};
                  await newTrack.start(el, options).catch(() => {});
                }
              }
            } catch (err) {
              const msg = err?.message || '';
              const name = err?.name || '';
              if (
                msg.includes('VideoNotStarted') ||
                msg.includes('Video not started') ||
                name === 'VideoNotStartedError'
              ) {
                // recreate silently
                try {
                  const newTrack =
                    ZoomVideoRef.current.createLocalVideoTrack(deviceId);
                  setLocalVideoTrack(newTrack);
                  const el = document.getElementById('local-preview-video');
                  if (el) {
                    const options =
                      backgroundOption === 'blur' ? { imageUrl: 'blur' } : {};
                    await newTrack.start(el, options).catch(() => {});
                  }
                } catch (_) {
                  /* ignore */
                }
              } else {
                throw err;
              }
            }
          } else {
            // no track yet — create and start
            try {
              const newTrack =
                ZoomVideoRef.current.createLocalVideoTrack(deviceId);
              setLocalVideoTrack(newTrack);
              const el = document.getElementById('local-preview-video');
              if (el) {
                const options =
                  backgroundOption === 'blur' ? { imageUrl: 'blur' } : {};
                await newTrack.start(el, options).catch(() => {});
              }
            } catch (_) {
              /* ignore */
            }
          }
        } else {
          // not video-on: if track exists try to set device silently where supported
          if (
            localVideoTrack &&
            typeof localVideoTrack.switchCamera === 'function'
          ) {
            await localVideoTrack.switchCamera(deviceId).catch(() => {});
          }
        }
      }

      // AUDIO handling
      const mikeIndex = parseInt(selectedMikeIndex);
      const audioDeviceId = audioDevices[mikeIndex]?.deviceId;
      if (audioDeviceId) {
        if (isAudioOn) {
          if (localAudioTrack) {
            try {
              if (typeof localAudioTrack.setDevice === 'function') {
                await localAudioTrack.setDevice(audioDeviceId);
              } else {
                // fallback: stop + recreate
                await localAudioTrack.stop().catch(() => {});
                const newAudio =
                  ZoomVideoRef.current.createLocalAudioTrack(audioDeviceId);
                setLocalAudioTrack(newAudio);
                await newAudio.start().catch(() => {});
                await (isAudioOn ? newAudio.unmute() : newAudio.mute()).catch(
                  () => {}
                );
              }
            } catch (err) {
              const msg = err?.message || '';
              const name = err?.name || '';
              if (
                msg.includes('AudioNotStarted') ||
                msg.includes('Audio not started') ||
                name === 'AudioNotStartedError'
              ) {
                try {
                  const newAudio =
                    ZoomVideoRef.current.createLocalAudioTrack(audioDeviceId);
                  setLocalAudioTrack(newAudio);
                  await newAudio.start().catch(() => {});
                  await (isAudioOn ? newAudio.unmute() : newAudio.mute()).catch(
                    () => {}
                  );
                } catch (_) {
                  /* ignore */
                }
              } else {
                throw err;
              }
            }
          } else {
            // no audio track yet — create and start
            try {
              const newAudio =
                ZoomVideoRef.current.createLocalAudioTrack(audioDeviceId);
              setLocalAudioTrack(newAudio);
              await newAudio.start().catch(() => {});
              await (isAudioOn ? newAudio.unmute() : newAudio.mute()).catch(
                () => {}
              );
            } catch (_) {
              /* ignore */
            }
          }
        } else {
          // not audio-on: try silent setDevice when supported
          if (
            localAudioTrack &&
            typeof localAudioTrack.setDevice === 'function'
          ) {
            await localAudioTrack.setDevice(audioDeviceId).catch(() => {});
          }
        }
      }
    };

    // small delay to ensure initial setup finished
    const timer = setTimeout(() => {
      updateDevices().catch(() => {});
    }, 100);

    return () => clearTimeout(timer);
  }, [
    selectedCameraIndex,
    selectedMikeIndex,
    loading,
    isVideoOn,
    isAudioOn,
    cameraDevices,
    audioDevices,
    backgroundOption,
  ]);

  const handleCancelSession = () => {
    const isPatientLeft = searchParams.get('isPatientLeft');
    const route =
      isPatientLeft === 'true'
        ? `/feedback?&appointmentID=${appointmentId}`
        : `/myprofile?tab=appointments`;
    router.push(route);
  };

  const handleJoinSession = debounce(async () => {
    // Store selected device preferences in localStorage
    setWaitingLobbyPresent(true);
    localStorage.setItem('selectedCamera', selectedCameraIndex);
    localStorage.setItem('selectedMike', selectedMikeIndex);
    localStorage.setItem('selectedSpeaker', selectedSpeakerIndex);
    localStorage.setItem('setVolume', volume);
    localStorage.setItem('isVideoOn', isVideoOn.toString());
    localStorage.setItem('isAudioOn', isAudioOn.toString());

    setHasToastBeenShown(false);
    localStorage.setItem('hasToastBeenShown', false);
    setJoinProcessing(true);

    try {
      if (localVideoTrack) {
        try {
          await localVideoTrack.stop();
          setLocalVideoTrack(null);
        } catch (err) {
          console.log('Error stopping video track:', err);
        }
      }

      if (localAudioTrack) {
        try {
          await localAudioTrack.stop();
          setLocalAudioTrack(null);
        } catch (err) {
          console.log('Error stopping audio track:', err);
        }
      }

      if (microphoneTester) {
        microphoneTester.stop();
        setMicrophoneTester(null);
      }
      if (speakerTester) {
        speakerTester.destroy();
        setSpeakerTester(null);
      }

      // Clear the Zoom client reference
      // if (ZoomVideoRef.current) {
      //   ZoomVideoRef.current = null;
      // }

      const patientJoinRequestResponse = await axiosAuth.put(
        `${process.env.NEXT_PUBLIC_PATIENT_REQUEST_SESSION}${sessionID}/patient/`
      );
      const { session_data } = patientJoinRequestResponse?.data;

      // if (isExpiredInTimezone(session_data.ExpirationTime, timeZone)) {
      //   Swal.fire({
      //     icon: 'error',
      //     title: 'Link has expired.',
      //     text: 'This link or session has expired. Redirecting you to the appointments page.',
      //     confirmButtonColor: 'var(--color-primary)',
      //     allowOutsideClick: false,
      //     allowEscapeKey: false,
      //     confirmButtonText: 'OK',
      //   }).then(() => {
      //     // window.location.href = `/myprofile?tab=appointments`;
      //     window.location.replace(`/myprofile?tab=appointments`);
      //   });

      //   return;
      // } else if (
      //   session_data.MeetingStatus === 2 ||
      //   (session_data.MeetingStatus === 3 && session_data.MeetingStatus === 1)
      // ) {
      //   setWaitingLobbyPresent(false);
      //   setMeetingStatusModalShow(true);
      //   setMeetingStatus('meeting expired');
      //   return;
      // }
      // ExpirationTime

      setJoinProcessing(false);
      setMeetingSessionData(patientJoinRequestResponse?.data);
    } catch (error) {
      console.error('Error joining session:', error);
    } finally {
      setJoinProcessing(false);
    }
  }, 1000);

  useEffect(() => {
    const hasToastBeenShownValue =
      typeof window !== 'undefined' &&
      localStorage.getItem('hasToastBeenShown') === 'true';
    if (hasToastBeenShown !== hasToastBeenShownValue) {
      setHasToastBeenShown(hasToastBeenShownValue);
    }
  }, [hasToastBeenShown]);

  useEffect(() => {
    if (!meetingStatusModalShow) return;

    const minimumDisplayTime = 5000;
    let timerDuration = Math.max(3000, minimumDisplayTime); // Ensures at least 5000ms
    let alertTitle = '';
    let alertText = '';
    let redirectUrl = '';

    switch (meetingStatus) {
      case 'Meeting ended by host':
        alertTitle = 'Meeting Ended';
        alertText =
          'The meeting has ended by host. Redirecting you to the feedback page in ';
        redirectUrl = `/feedback?&appointmentID=${appointmentId}`;
        break;
      case 'you left the meeting':
        alertTitle = 'Meeting Left';
        alertText =
          'You left the meeting. Redirecting you to the feedback page in ';
        redirectUrl = `/feedback?&appointmentID=${appointmentId}`;
        break;
      case 'meeting expired':
        alertTitle = 'Meeting Expired';
        alertText = 'Meeting expired. Redirecting you in ';
        timerDuration = Math.max(2000, minimumDisplayTime); // Ensures at least 5000ms
        redirectUrl = '/meetexpert';
        break;
      default:
        return;
    }

    let remainingTime = timerDuration / 1000;
    let interval;

    Swal.fire({
      title: alertTitle,
      html: `${alertText} <strong>${remainingTime}</strong> seconds...`,
      icon: meetingStatus === 'meeting expired' ? 'warning' : 'info',
      timer: timerDuration,
      showConfirmButton: true,
      confirmButtonText: 'OK',
      confirmButtonColor: 'var(--color-primary)',
      customClass: {
        timerProgressBar: 'custom-progress-bar',
      },
      didOpen: () => {
        const content = Swal.getHtmlContainer().querySelector('strong');
        const interval = setInterval(() => {
          remainingTime -= 1;
          content.textContent = remainingTime;
        }, 1000);

        // Clear interval and redirect when timer is done
        Swal.showLoading();
        Swal.stopTimer();
        setTimeout(() => {
          Swal.resumeTimer();
          clearInterval(interval);
        }, timerDuration);
      },
      willClose: () => {
        if (typeof window !== 'undefined' && redirectUrl) {
          window.location.href = redirectUrl;
        }
        setMeetingStatusModalShow(false);
      },
    });

    return () => {
      // Clear the interval when the component unmounts
      clearInterval(interval);
    };
  }, [
    meetingStatus,
    meetingStatusModalShow,
    appointmentId,
    setMeetingStatusModalShow,
  ]);

  useEffect(() => {
    // Function to handle screen size changes
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsXLargeScreen(window.innerWidth >= 1200);
      }
    };

    // Initialize on component mount
    handleResize();

    // Add event listener to monitor screen size changes
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div>
            {waitingLobbyPresent === true ? (
              <>
                <WaitingLobby
                  meetingSessionData={meetingSessionData}
                  setWaitingLobbyPresent={setWaitingLobbyPresent}
                />
              </>
            ) : (
              <>
                <audio
                  id="audioPlayer"
                  controls
                  src="/audio/better-day.mp3"
                  style={{ display: 'none' }}>
                  Your browser does not support the <code>audio</code> element.
                </audio>
                <div className="preview-container">
                  <div className="dialog-wrapper">
                    <div className="preview-dialog-box">
                      <p className="dialog-title fw-bold">
                        Appointment Call Preview
                      </p>
                      {isPlaying && (
                        <>
                          <div className="d-flex">
                            <p className="dialog-title fw-light mt-2">
                              Sample Audio
                            </p>

                            <Image
                              className=""
                              src={audiowave}
                              alt="audiowave"
                              height={50}
                              width={400}
                            />
                          </div>
                          {speakerTester && (
                            <div>
                              <label
                                htmlFor="speaker-output-level"
                                className="my-3">
                                Audio Output level:
                              </label>
                              &nbsp;&nbsp;&nbsp;&nbsp;
                              <progress
                                id="speaker-output-level"
                                max="100"
                                value={outputLevel}
                                style={{ width: '77%' }}></progress>
                            </div>
                          )}
                        </>
                      )}
                      {isMikeChecked && (
                        <div>
                          <label
                            htmlFor="mic-input-level"
                            className="my-3">
                            Audio Input level:
                          </label>
                          &nbsp;&nbsp;&nbsp;&nbsp;
                          <progress
                            id="mic-input-level"
                            max="100"
                            value={inputLevel}
                            style={{ width: '77%' }}></progress>
                        </div>
                      )}
                      <div className="title-bar"></div>
                      <div className="row">
                        <div className=" col-12 col-lg-7  mt-3">
                          <div className="bg-black">
                            {/* Changed the video element to match the expected structure */}
                            <video-player-container className="local-preview-container">
                              <video-player id="local-preview-video"></video-player>
                            </video-player-container>

                            {!isVideoOn && (
                              <div className="camera_off_icon">
                                <BsCameraVideoOffFill
                                  style={{
                                    color: 'var(--color-primary)',
                                    fontSize: '25px',
                                  }}
                                />
                                <p className="text-secondary">Camera is Off</p>
                              </div>
                            )}
                          </div>

                          <div className="custom-shadow ">
                            <div className="row">
                              <div className="col-6 d-flex align-items-center">
                                {isVideoOn ? (
                                  <>
                                    <BsCameraVideoFill
                                      style={{
                                        color: '#B5B2B2',
                                        fontSize: '18px',
                                        marginRight: '7px',
                                      }}
                                    />
                                  </>
                                ) : (
                                  <>
                                    <BsFillCameraVideoOffFill
                                      style={{
                                        color: '#B5B2B2',
                                        fontSize: '18px',
                                        marginRight: '7px',
                                      }}
                                    />
                                  </>
                                )}
                                <div className="form-check form-switch d-flex justify-content-center align-items-center">
                                  <input
                                    className="form-check-input custom-switch "
                                    type="checkbox"
                                    id="flexSwitchCheckDefault"
                                    checked={isVideoOn}
                                    onChange={toggleVideo}
                                    readOnly={
                                      permissionGranted.camera === false
                                    }
                                    disabled={
                                      permissionGranted.camera === false
                                    }
                                  />
                                  <label
                                    className="form-check-label pre-custom-label ms-2 d-none d-sm-block"
                                    htmlFor="flexSwitchCheckDefault">
                                    {isVideoOn ? 'Video On' : 'Video off'}
                                  </label>
                                </div>
                              </div>
                              {/* FaMicrophoneSlash  */}
                              <div className="col-6 d-flex align-items-center">
                                {isAudioOn ? (
                                  <FaMicrophone
                                    style={{
                                      color: '#B5B2B2',
                                      fontSize: '18px',
                                      marginRight: '7px',
                                    }}
                                  />
                                ) : (
                                  <FaMicrophoneSlash
                                    style={{
                                      color: '#B5B2B2',
                                      fontSize: '18px',
                                      marginRight: '7px',
                                    }}
                                  />
                                )}
                                <div className="form-check form-switch d-flex justify-content-center align-items-center">
                                  <input
                                    className="form-check-input custom-switch"
                                    type="checkbox"
                                    id="flexSwitchCheckDefault"
                                    checked={isAudioOn}
                                    onChange={toggleAudio}
                                    readOnly={
                                      permissionGranted.microphone === false
                                    }
                                    disabled={
                                      permissionGranted.microphone === false
                                    }
                                  />
                                  <label
                                    className="form-check-label pre-custom-label ms-2 d-none d-sm-block"
                                    htmlFor="flexSwitchCheckDefault">
                                    {isAudioOn ? 'Unmute' : 'Mute'}
                                  </label>
                                </div>
                              </div>
                            </div>
                            {permissionAlert && (
                              <Alert
                                key="danger"
                                variant="danger">
                                {permissionAlert}
                              </Alert>
                            )}
                          </div>
                        </div>
                        <div className=" col-12 col-lg-5 ">
                          <div className="custom-shadow mt-3">
                            <div className="radio-option">
                              <label htmlFor="computerAudio">
                                <FaMicrophone
                                  size={22}
                                  color="var(--color-primary)"
                                />
                                <span className="ps-3 custom-font-size">
                                  Test Mike
                                </span>
                              </label>
                              <input
                                type="checkbox"
                                className="form-check-input custom-radio"
                                id="computerAudio"
                                name="audioOption"
                                value="computerAudio"
                                checked={isMikeChecked}
                                onChange={handleTestMike}
                              />
                            </div>

                            <div className="radio-option">
                              <label htmlFor="externalSpeakers">
                                <RiUserVoiceFill
                                  style={{
                                    color: 'var(--color-primary)',
                                    fontSize: '22px',
                                  }}
                                />
                                <span className="ps-3 custom-font-size">
                                  Test Speakers
                                </span>
                              </label>
                              <input
                                type="checkbox"
                                className="form-check-input custom-radio"
                                id="externalSpeakers"
                                name="audioOption"
                                value="externalSpeakers"
                                checked={isPlaying}
                                onChange={handleTestSpeaker}
                              />
                            </div>
                          </div>

                          <div className="custom-shadow mt-3">
                            <div className="d-flex mb-3">
                              <span>
                                <RxSpeakerLoud
                                  style={{
                                    color: 'var(--color-primary)',
                                    fontSize: '22px',
                                    marginRight: '10px',
                                  }}
                                />
                                {'   '}
                                <span className="custom-font-size">
                                  Browser Volume
                                </span>
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="1"
                              value={volume}
                              onChange={e => handleVolumeChange(e.target.value)}
                              style={{
                                width: '100%',
                                height: '2px',
                                borderRadius: '5px',
                                background: 'var(--color-primary)',
                                outline: 'none',
                                appearance: 'none',
                                marginBottom: '10px',
                              }}
                            />
                          </div>
                          <div
                            className="cursor-pointer custom-shadow mb-0 d-flex flex-fill justify-content-between align-items-center mt-3"
                            onClick={() => handleSettingsClick(true)}>
                            <div>
                              <IoSettings
                                style={{
                                  color: 'var(--color-primary)',
                                  fontSize: '22px',
                                  marginRight: '10px',
                                }}
                              />{' '}
                              <span className="custom-font-size">Settings</span>
                            </div>
                            <MdOutlineArrowForwardIos
                              style={{
                                color: 'var(--color-primary)',
                                fontSize: '22px',
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mt-3">
                        <div className="col-sm d-flex justify-content-end">
                          <button
                            type="button"
                            className="btn me-3 grey-btn"
                            onClick={handleCancelSession}>
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn purple-btn"
                            onClick={handleJoinSession}
                            disabled={joinProcessing}>
                            {joinProcessing ? 'Please wait...' : 'Join Now'}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="d-none d-xl-block">
                      {isXLargeScreen && isSettingsVisible && (
                        <Settings
                          appointmentId={appointmentId}
                          sessionID={sessionID}
                          setBackgroundOption={setBackgroundOption}
                          backgroundOption={backgroundOption}
                          cameraDevices={cameraDevices}
                          audioDevices={audioDevices}
                          speakerDevices={speakerDevices}
                          selectedCameraIndex={selectedCameraIndex}
                          setSelectedCameraIndex={setSelectedCameraIndex}
                          selectedMikeIndex={selectedMikeIndex}
                          setSelectedMikeIndex={setSelectedMikeIndex}
                          handleSettingsClick={handleSettingsClick}
                          localVideoTrack={localVideoTrack}
                          stream={stream}
                          setIsVideoOn={setIsVideoOn}
                          VB_BACKGROUNDS={VB_BACKGROUNDS}
                          isVideoOn={isVideoOn}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
      <div>
        {!isXLargeScreen && (
          <Modal
            show={isSettingsVisible}
            onHide={() => handleSettingsClick(false)}
            centered
            className="d-xl-none">
            <Modal.Body className=" border-0">
              <Settings
                appointmentId={appointmentId}
                sessionID={sessionID}
                setBackgroundOption={setBackgroundOption}
                backgroundOption={backgroundOption}
                cameraDevices={cameraDevices}
                audioDevices={audioDevices}
                speakerDevices={speakerDevices}
                selectedCameraIndex={selectedCameraIndex}
                setSelectedCameraIndex={setSelectedCameraIndex}
                selectedMikeIndex={selectedMikeIndex}
                setSelectedMikeIndex={setSelectedMikeIndex}
                handleSettingsClick={handleSettingsClick}
                localVideoTrack={localVideoTrack}
                stream={stream}
                setIsVideoOn={setIsVideoOn}
                VB_BACKGROUNDS={VB_BACKGROUNDS}
                isVideoOn={isVideoOn}
              />
            </Modal.Body>
          </Modal>
        )}
      </div>
    </>
  );
};

export default Preview;
