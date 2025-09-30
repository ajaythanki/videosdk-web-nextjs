import { useState, useEffect } from 'react';

export function useMultiShare(zmClient, mediaStream) {
  const [isRecieveSharing, setIsRecieveSharing] = useState(false);
  const [shareUserList, setShareUserList] = useState([]);

  useEffect(() => {
    const onActiveShareChange = ({ state }) => {
      setIsRecieveSharing(state === 'Active');
    };

    zmClient.on('active-share-change', onActiveShareChange);
    return () => {
      zmClient.off('active-share-change', onActiveShareChange);
    };
  }, [zmClient]);

  return {
    isRecieveSharing,
    shareUserList
  };
}
