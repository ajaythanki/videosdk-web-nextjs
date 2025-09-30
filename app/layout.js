'use client';

import { useEffect, useState, useCallback, useReducer, useMemo, useRef } from 'react';
import ZoomVideo, { ConnectionState, ReconnectReason } from '@zoom/videosdk';
import { Modal, Toast, ToastContainer } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import produce from 'immer';
import ZoomContext from '../src/context/zoom-context';
import ZoomMediaContext from '../src/context/media-context';
import LoadingLayer from '../src/component/loading-layer';
import '../src/App.css';
import '../src/index.css';

const mediaShape = {
  audio: {
    encode: false,
    decode: false
  },
  video: {
    encode: false,
    decode: false
  },
  share: {
    encode: false,
    decode: false
  }
};

const mediaReducer = produce((draft, action) => {
  switch (action.type) {
    case 'audio-encode': {
      draft.audio.encode = action.payload;
      break;
    }
    case 'audio-decode': {
      draft.audio.decode = action.payload;
      break;
    }
    case 'video-encode': {
      draft.video.encode = action.payload;
      break;
    }
    case 'video-decode': {
      draft.video.decode = action.payload;
      break;
    }
    case 'share-encode': {
      draft.share.encode = action.payload;
      break;
    }
    case 'share-decode': {
      draft.share.decode = action.payload;
      break;
    }
    case 'reset-media': {
      Object.assign(draft, { ...mediaShape });
      break;
    }
    default:
      break;
  }
}, mediaShape);

if (typeof window !== 'undefined') {
  window.zmClient = undefined;
  window.mediaStream = undefined;
  window.webEndpoint = undefined;
  window.ltClient = undefined;
  window.logClient = undefined;
}

export default function RootLayout({ children }) {
  const [zmClient] = useState(() => {
    if (typeof window !== 'undefined') {
      return ZoomVideo.createClient();
    }
    return null;
  });
  const [loading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('');
  const [isFailover, setIsFailover] = useState(false);
  const [status, setStatus] = useState('closed');
  const [mediaState, dispatch] = useReducer(mediaReducer, mediaShape);
  const [mediaStream, setMediaStream] = useState(null);
  const [isSupportGalleryView, setIsSupportGalleryView] = useState(false);
  const [meetingArgs, setMeetingArgs] = useState(null);
  const hasInitialized = useRef(false);

  const mediaContext = useMemo(() => ({ ...mediaState, mediaStream }), [mediaState, mediaStream]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Parse meeting args from URL
    const urlParams = new URLSearchParams(window.location.search);
    const args = Object.fromEntries(urlParams);
    
    // Import dev config dynamically
    import('../src/config/dev').then(({ devConfig }) => {
      let finalArgs = { ...args };
      
      if (!args.sdkKey || !args.topic || !args.name || !args.signature) {
        finalArgs = { ...devConfig, ...args };
      }

      if (args.web && args.web !== '0') {
        ['topic', 'name', 'password', 'sessionKey', 'userIdentity'].forEach((field) => {
          if (Object.hasOwn(finalArgs, field)) {
            try {
              const { b64DecodeUnicode } = require('../src/utils/util');
              finalArgs[field] = b64DecodeUnicode(finalArgs[field]);
            } catch (e) {
              console.log('ignore base64 decode', field, finalArgs[field]);
            }
          }
        });
        if (finalArgs.role) {
          finalArgs.role = parseInt(finalArgs.role, 10);
        } else {
          finalArgs.role = 1;
        }
      }

      finalArgs.useVideoPlayer = 1;

      ['enforceGalleryView', 'enforceVB', 'cloud_recording_option', 'cloud_recording_election'].forEach((field) => {
        if (Object.hasOwn(finalArgs, field)) {
          try {
            finalArgs[field] = Number(finalArgs[field]);
          } catch (e) {
            finalArgs[field] = 0;
          }
        }
      });

      if (finalArgs?.telemetry_tracking_id) {
        try {
          const { b64DecodeUnicode } = require('../src/utils/util');
          finalArgs.telemetry_tracking_id = b64DecodeUnicode(finalArgs.telemetry_tracking_id);
        } catch (e) {}
      } else {
        finalArgs.telemetry_tracking_id = '';
      }

      if (!finalArgs.signature && finalArgs.sdkSecret && finalArgs.topic) {
        const { generateVideoToken } = require('../src/utils/util');
        finalArgs.signature = generateVideoToken(
          finalArgs.sdkKey,
          finalArgs.sdkSecret,
          finalArgs.topic,
          finalArgs.sessionKey,
          finalArgs.userIdentity,
          Number(finalArgs.role ?? 1),
          finalArgs.cloud_recording_option,
          finalArgs.cloud_recording_election,
          finalArgs.telemetry_tracking_id
        );
      }

      setMeetingArgs(finalArgs);
    });
  }, []);

  useEffect(() => {
    if (!zmClient || !meetingArgs || hasInitialized.current) return;

    const init = async () => {
      const {
        topic,
        signature,
        name,
        password,
        webEndpoint: webEndpointArg,
        enforceGalleryView,
        enforceVB
      } = meetingArgs;

      let webEndpoint = webEndpointArg || window?.webEndpoint || 'zoom.us';
      const galleryViewWithoutSAB = Number(enforceGalleryView) === 1 && !window.crossOriginIsolated;
      const vbWithoutSAB = Number(enforceVB) === 1 && !window.crossOriginIsolated;

      await zmClient.init('en-US', `${window.location.origin}/lib`, {
        webEndpoint,
        enforceMultipleVideos: galleryViewWithoutSAB,
        enforceVirtualBackground: vbWithoutSAB,
        stayAwake: true,
        patchJsMedia: true,
        leaveOnPageUnload: false
      });

      try {
        setLoadingText('Joining the session...');
        await zmClient.join(topic, signature, name, password).catch((e) => {
          console.log(e);
        });
        const stream = zmClient.getMediaStream();
        setMediaStream(stream);
        setIsSupportGalleryView(stream.isSupportMultipleVideos());
        setIsLoading(false);
        hasInitialized.current = true;
      } catch (e) {
        setIsLoading(false);
        message.error(e.reason);
      }
    };

    init();

    return () => {
      if (hasInitialized.current && zmClient.getSessionInfo()?.isInMeeting) {
        ZoomVideo.destroyClient();
        hasInitialized.current = false;
      }
    };
  }, [zmClient, meetingArgs]);

  const onConnectionChange = useCallback(
    (payload) => {
      if (payload.state === ConnectionState.Reconnecting) {
        setIsLoading(true);
        setIsFailover(true);
        setStatus('connecting');
        const { reason, subsessionName } = payload;
        if (reason === ReconnectReason.Failover) {
          setLoadingText('Session Disconnected, Try to reconnect');
        } else if (reason === ReconnectReason.JoinSubsession || reason === ReconnectReason.MoveToSubsession) {
          setLoadingText(`Joining ${subsessionName}...`);
        } else if (reason === ReconnectReason.BackToMainSession) {
          setLoadingText('Returning to Main Session...');
        }
      } else if (payload.state === ConnectionState.Connected) {
        setStatus('connected');
        if (isFailover) {
          setIsLoading(false);
        }
        if (typeof window !== 'undefined') {
          window.zmClient = zmClient;
          window.mediaStream = zmClient.getMediaStream();
        }
        console.log('getSessionInfo', zmClient.getSessionInfo());
      } else if (payload.state === ConnectionState.Closed || payload.state === ConnectionState.Fail) {
        setStatus('closed');
        dispatch({ type: 'reset-media' });
        if (payload.state === ConnectionState.Fail) {
          Modal.error({
            title: 'Join meeting failed',
            content: `Join meeting failed. reason:${payload.reason ?? ''}`
          });
        }
        if (payload.reason === 'ended by host') {
          Modal.warning({
            title: 'Meeting ended',
            content: 'This meeting has been ended by host'
          });
        }
      }
    },
    [isFailover, zmClient]
  );

  const onMediaSDKChange = useCallback((payload) => {
    const { action, type, result } = payload;
    dispatch({ type: `${type}-${action}`, payload: result === 'success' });
  }, []);

  useEffect(() => {
    if (!zmClient) return;

    zmClient.on('connection-change', onConnectionChange);
    zmClient.on('media-sdk-change', onMediaSDKChange);

    return () => {
      zmClient.off('connection-change', onConnectionChange);
      zmClient.off('media-sdk-change', onMediaSDKChange);
    };
  }, [zmClient, onConnectionChange, onMediaSDKChange]);

  if (!zmClient) {
    return null;
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Zoom Video SDK Demo" />
        <link rel="manifest" href="/manifest.json" />
        <title>VideoSDK Demo</title>
        <script dangerouslySetInnerHTML={{
          __html: `
            var urlArgs = Object.fromEntries(new URLSearchParams(location.search));
            window.webEndpoint = urlArgs.webEndpoint || urlArgs.web;
          `
        }} />
      </head>
      <body>
        <div className="App">
          {loading && <LoadingLayer content={loadingText} />}
          {!loading && (
            <ZoomContext.Provider value={zmClient}>
              <ZoomMediaContext.Provider value={mediaContext}>
                {children}
              </ZoomMediaContext.Provider>
            </ZoomContext.Provider>
          )}
        </div>
      </body>
    </html>
  );
}
