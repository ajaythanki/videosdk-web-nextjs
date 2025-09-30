import { useUnmount } from '../../../hooks/useUnmount';

export function useCleanUp(container, zmClient, mediaStream) {
  useUnmount(() => {
    if (container) {
      zmClient.getAllUser().forEach((user) => {
        if (user.bVideoOn && user.userId !== zmClient.getSessionInfo().userId) {
          mediaStream?.stopRenderVideo(container, user.userId);
        }
      });
    }
  });
}
