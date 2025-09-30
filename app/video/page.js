'use client';

import { useContext } from 'react';
import ZoomMediaContext from '../../src/context/media-context';
import Video from '../../src/feature/video/video';
import VideoSingle from '../../src/feature/video/video-single';
import VideoAttach from '../../src/feature/video/video-attach';

export default function VideoPage() {
  const { mediaStream } = useContext(ZoomMediaContext);
  const isSupportGalleryView = mediaStream?.isSupportMultipleVideos();
  const galleryViewWithAttach = true;

  if (isSupportGalleryView) {
    return galleryViewWithAttach ? <VideoAttach /> : <Video />;
  }
  
  return <VideoSingle />;
}
