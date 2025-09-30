import { useState, useEffect, useCallback, useContext } from 'react';

export function useShare(zmClient, mediaStream, shareRef) {
  const [isRecieveSharing, setIsRecieveSharing] = useState(false);
  const [sharedContentDimension, setSharedContentDimension] = useState({ width: 0, height: 0 });
  const [shareUserList, setShareUserList] = useState([]);
  const [activeSharingId, setActiveSharingId] = useState(0);

  useEffect(() => {
    const onActiveShareChange = ({ state, userId }) => {
      if (state === 'Active') {
        setIsRecieveSharing(true);
        setActiveSharingId(userId);
      } else {
        setIsRecieveSharing(false);
        setActiveSharingId(0);
      }
    };

    zmClient.on('active-share-change', onActiveShareChange);
    return () => {
      zmClient.off('active-share-change', onActiveShareChange);
    };
  }, [zmClient]);

  return {
    isRecieveSharing,
    sharedContentDimension,
    shareUserList,
    activeSharingId,
    setActiveSharingId
  };
}
