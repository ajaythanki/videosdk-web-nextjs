import { useEffect } from 'react';
import { usePrevious, usePersistFn } from '../../../hooks';
import { isArrayShallowEqual } from '../../../utils/util';
import { SELF_VIDEO_ID } from '../video-constants';

export function useRenderVideo(
  mediaStream,
  isVideoDecodeReady,
  videoRef,
  layout,
  subscribedVideos,
  participants,
  currentUserId
) {
  const renderedVideos = subscribedVideos.slice(0, layout.length);
  const previousRenderedVideos = usePrevious(renderedVideos);
  const previousLayout = usePrevious(layout);
  const previousParticipants = usePrevious(participants);
  const previousIsVideoDecodeReady = usePrevious(isVideoDecodeReady);

  useEffect(() => {
    if (videoRef.current && layout && layout.length > 0 && isVideoDecodeReady) {
      const addedSubscribers = renderedVideos.filter((id) => !(previousRenderedVideos || []).includes(id));
      const removedSubscribers = (previousRenderedVideos || []).filter((id) => !renderedVideos.includes(id));
      const unalteredSubscribers = renderedVideos.filter((id) => (previousRenderedVideos || []).includes(id));
      
      if (removedSubscribers.length > 0) {
        removedSubscribers.forEach(async (userId) => {
          if (mediaStream?.isRenderSelfViewWithVideoElement() && userId === currentUserId) {
            const videoElement = document.querySelector(`#${SELF_VIDEO_ID}`);
            await mediaStream?.stopRenderVideo(videoElement, userId);
          } else {
            await mediaStream?.stopRenderVideo(videoRef.current, userId);
          }
        });
      }
      
      if (addedSubscribers.length > 0) {
        addedSubscribers.forEach(async (userId) => {
          const index = participants.findIndex((user) => user.userId === userId);
          const cellDimension = layout[index];
          if (cellDimension) {
            let canvas = videoRef.current;
            if (mediaStream?.isRenderSelfViewWithVideoElement() && userId === currentUserId) {
              canvas = document.querySelector(`#${SELF_VIDEO_ID}`);
            }
            const { width, height, x, y, quality } = cellDimension;
            await mediaStream?.renderVideo(canvas, userId, width, height, x, y, quality);
          }
        });
      }
      
      if (unalteredSubscribers.length > 0) {
        if (previousLayout && !isArrayShallowEqual(layout, previousLayout)) {
          unalteredSubscribers.forEach(async (userId) => {
            const index = participants.findIndex((user) => user.userId === userId);
            const cellDimension = layout[index];
            let canvas = videoRef.current;
            if (mediaStream?.isRenderSelfViewWithVideoElement() && userId === currentUserId) {
              canvas = document.querySelector(`#${SELF_VIDEO_ID}`);
            }
            if (cellDimension) {
              const { width, height, x, y, quality } = cellDimension;
              if (previousLayout?.[index] && previousLayout[index].quality !== quality) {
                await mediaStream?.renderVideo(canvas, userId, width, height, x, y, quality);
              }
              const isSkip = mediaStream?.isRenderSelfViewWithVideoElement() && userId === currentUserId;
              if (!isSkip) {
                await mediaStream?.adjustRenderedVideoPosition(canvas, userId, width, height, x, y);
              }
            }
          });
        }
        
        const participantsIds = participants.map((user) => user.userId);
        const previousParticipantsIds = previousParticipants?.map((user) => user.userId);
        if (participantsIds.join('-') !== previousParticipantsIds?.join('-')) {
          unalteredSubscribers.forEach(async (userId) => {
            const index = participantsIds.findIndex((id) => id === userId);
            const previousIndex = previousParticipantsIds?.findIndex((id) => id === userId);
            if (index !== previousIndex) {
              const cellDimension = layout[index];
              const isSkip = mediaStream?.isRenderSelfViewWithVideoElement() && userId === currentUserId;
              if (cellDimension && !isSkip) {
                const { width, height, x, y } = cellDimension;
                await mediaStream?.adjustRenderedVideoPosition(
                  videoRef.current,
                  userId,
                  width,
                  height,
                  x,
                  y
                );
              }
            }
          });
        }
      }
    }
  }, [
    mediaStream,
    isVideoDecodeReady,
    videoRef,
    layout,
    previousLayout,
    participants,
    previousParticipants,
    renderedVideos,
    previousRenderedVideos,
    currentUserId
  ]);

  useEffect(() => {
    if (previousIsVideoDecodeReady === false && isVideoDecodeReady === true && subscribedVideos.length > 0) {
      subscribedVideos.forEach(async (userId) => {
        const index = participants.findIndex((user) => user.userId === userId);
        const cellDimension = layout[index];
        let canvas = videoRef.current;
        if (mediaStream?.isRenderSelfViewWithVideoElement() && userId === currentUserId) {
          canvas = document.querySelector(`#${SELF_VIDEO_ID}`);
        }
        if (cellDimension) {
          const { width, height, x, y, quality } = cellDimension;
          await mediaStream?.renderVideo(canvas, userId, width, height, x, y, quality);
        }
      });
    }
  }, [
    mediaStream,
    videoRef,
    layout,
    participants,
    subscribedVideos,
    isVideoDecodeReady,
    previousIsVideoDecodeReady,
    currentUserId
  ]);
  
  const stopAllVideos = usePersistFn((videoCanvasDOM) => {
    if (subscribedVideos.length > 0) {
      subscribedVideos.forEach((userId) => {
        mediaStream?.stopRenderVideo(videoCanvasDOM, userId);
      });
    }
  });
  
  useEffect(() => {
    const videoCanvasDOM = videoRef.current;
    return () => {
      stopAllVideos(videoCanvasDOM);
    };
  }, [videoRef, stopAllVideos]);
}
