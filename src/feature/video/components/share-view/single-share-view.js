'use client';

import { useRef, useContext, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import classnames from 'classnames';
import Draggable from 'react-draggable';
import _ from 'lodash';
import ZoomContext from '../../../../context/zoom-context';
import ZoomMediaContext from '../../../../context/media-context';
import ShareBar from '../share-bar';
import ShareIndicationBar from '../share-indication';
import { useShare } from '../../hooks/useShare';
import { useRemoteControl } from '../../hooks/useRemoteControl';
import { useMount, usePrevious, useSizeCallback } from '../../../../hooks';
import { isShallowEqual } from '../../../../utils/util';
import { ShareViewType } from '../../video-constants';
import { useSearchParams } from 'next/navigation';
import './share-view.scss';

const DragThreshod = 50;

const SingleShareView = forwardRef((props, ref) => {
  const { onRecieveSharingChange } = props;
  const zmClient = useContext(ZoomContext);
  const { mediaStream } = useContext(ZoomMediaContext);
  const selfShareViewRef = useRef(null);
  const shareCanvasRef = useRef(null);
  const shareVideoPlayerRef = useRef(null);
  const shareViewContainerRef = useRef(null);
  const shareViewViewportRef = useRef(null);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [shareViewSize, setShareViewSize] = useState({ width: 0, height: 0 });
  const [viewType, setViewType] = useState(ShareViewType.FitWindow);
  const [originalViewPosition, setOriginalViewPosition] = useState({ x: 0, y: 0 });
  const previousViewType = usePrevious(viewType);
  const previousShareViewSize = usePrevious(shareViewSize);
  const debounceRef = useRef(_.debounce(setContainerSize, 300));
  const searchParams = useSearchParams();
  const isVideoPlayer = searchParams.get('useVideoPlayer') === '1';
  
  const { isRecieveSharing, sharedContentDimension, shareUserList, activeSharingId, setActiveSharingId } = useShare(
    zmClient,
    mediaStream,
    isVideoPlayer ? shareVideoPlayerRef : shareCanvasRef
  );
  
  const { isControllingUser, controllingUser } = useRemoteControl(
    zmClient,
    mediaStream,
    selfShareViewRef.current,
    isVideoPlayer ? shareVideoPlayerRef.current : shareCanvasRef.current
  );

  const onContainerResize = useCallback(({ width, height }) => {
    if (shareViewContainerRef.current) {
      debounceRef.current({ width, height });
    }
  }, []);
  
  useMount(() => {
    if (shareViewContainerRef.current) {
      const { width, height } = shareViewContainerRef.current.getBoundingClientRect();
      setContainerSize({ width, height });
    }
  });
  
  useSizeCallback(shareViewContainerRef.current, onContainerResize);
  
  const onShareViewDrag = useCallback(
    (_event, { x, y }) => {
      const { width, height } = sharedContentDimension;
      const { width: vWidth, height: vHeight } = shareViewSize;
      setOriginalViewPosition((payload) => {
        let nX = payload.x;
        let nY = payload.y;
        if ((x < 0 && Math.abs(x) < width - DragThreshod) || (x > 0 && x < vWidth - DragThreshod)) {
          nX = x;
        }
        if ((y < 0 && Math.abs(y) < height - DragThreshod) || (y > 0 && y < vHeight - DragThreshod)) {
          nY = y;
        }
        return { x: nX, y: nY };
      });
    },
    [sharedContentDimension, shareViewSize]
  );

  useEffect(() => {
    if (
      isRecieveSharing &&
      shareViewContainerRef.current &&
      containerSize.width > 0 &&
      sharedContentDimension.width > 0
    ) {
      const { width, height } = sharedContentDimension;
      const { width: containerWidth, height: containerHeight } = containerSize;
      if (viewType === ShareViewType.FitWindow) {
        const ratio = Math.min(containerWidth / width, containerHeight / height, 1);
        setShareViewSize({
          width: Math.floor(width * ratio),
          height: Math.floor(height * ratio)
        });
        setOriginalViewPosition({ x: 0, y: 0 });
      } else {
        setShareViewSize({ width, height });
      }
    }
  }, [isRecieveSharing, containerSize, sharedContentDimension, viewType]);

  useEffect(() => {
    if (previousViewType === ShareViewType.FitWindow && viewType === ShareViewType.OriginalSize) {
      const { width: vWidth, height: vHeight } = previousShareViewSize;
      const { width, height } = sharedContentDimension;
      const { width: containerWidth, height: containerHeight } = containerSize;
      const x = Math.floor(((containerWidth - vWidth) / 2 / vWidth) * width);
      const y = Math.floor(((containerHeight - vHeight) / 2 / vHeight) * height);
      setOriginalViewPosition({ x: -x, y: -y });
    }
  }, [viewType, previousViewType, sharedContentDimension, containerSize, previousShareViewSize]);

  useEffect(() => {
    onRecieveSharingChange?.(isRecieveSharing);
  }, [isRecieveSharing, onRecieveSharingChange]);

  useImperativeHandle(ref, () => ({
    selfShareRef: selfShareViewRef.current
  }));

  return (
    <div
      className={classnames('share-container', {
        'share-container-in-sharing': isRecieveSharing
      })}
      ref={shareViewContainerRef}
    >
      <div
        className={classnames('share-container-viewport', {
          'in-sharing': isRecieveSharing,
          'is-original-size': viewType === ShareViewType.OriginalSize
        })}
        ref={shareViewViewportRef}
      >
        <Draggable
          disabled={viewType === ShareViewType.FitWindow}
          onDrag={onShareViewDrag}
          position={originalViewPosition}
        >
          <div
            className={classnames('share-canvas-container')}
            style={{
              width: `${shareViewSize.width}px`,
              height: `${shareViewSize.height}px`
            }}
          >
            {isVideoPlayer ? (
              <video
                className={classnames('share-canvas', {
                  'in-sharing': isRecieveSharing
                })}
                ref={shareVideoPlayerRef}
              />
            ) : (
              <canvas
                className={classnames('share-canvas', {
                  'in-sharing': isRecieveSharing
                })}
                ref={shareCanvasRef}
              />
            )}
            <canvas className="share-canvas" ref={selfShareViewRef} />
          </div>
        </Draggable>
      </div>
      {isRecieveSharing && (
        <>
          <ShareBar
            viewType={viewType}
            setViewType={setViewType}
            isControllingUser={isControllingUser}
            controllingUser={controllingUser}
          />
          <ShareIndicationBar
            shareUserList={shareUserList}
            activeSharingId={activeSharingId}
            setActiveSharingId={setActiveSharingId}
          />
        </>
      )}
    </div>
  );
});

SingleShareView.displayName = 'SingleShareView';

export default SingleShareView;
