import { useState, useEffect } from 'react';

export function useRemoteControl(zmClient, mediaStream, selfShareRef, shareRef) {
  const [isControllingUser, setIsControllingUser] = useState(false);
  const [controllingUser, setControllingUser] = useState(null);

  useEffect(() => {
    const onRemoteControlChange = ({ isControlling, userId }) => {
      setIsControllingUser(isControlling);
      if (isControlling) {
        const user = zmClient.getUser(userId);
        setControllingUser(user);
      } else {
        setControllingUser(null);
      }
    };

    zmClient.on('share-can-see-screen-change', onRemoteControlChange);
    return () => {
      zmClient.off('share-can-see-screen-change', onRemoteControlChange);
    };
  }, [zmClient]);

  return {
    isControllingUser,
    controllingUser
  };
}
