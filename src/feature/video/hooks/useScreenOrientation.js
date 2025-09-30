import { useState, useEffect } from 'react';
import { isAndroidOrIOSBrowser } from '../../../utils/platform';

export const useScreenOrientation = () => {
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);

  useEffect(() => {
    const updateOrientation = () => {
      if (!isAndroidOrIOSBrowser()) {
        setIsMobilePortrait(false);
        return;
      }

      if (typeof window !== 'undefined' && screen.orientation) {
        const isPortrait = screen.orientation.type.includes('portrait');
        setIsMobilePortrait(isPortrait);
      } else if (typeof window !== 'undefined') {
        const isPortrait = window.innerHeight > window.innerWidth;
        setIsMobilePortrait(isPortrait);
      }
    };

    updateOrientation();

    if (typeof window !== 'undefined' && screen.orientation) {
      screen.orientation.addEventListener('change', updateOrientation);
    } else if (typeof window !== 'undefined') {
      window.addEventListener('orientationchange', updateOrientation);
      window.addEventListener('resize', updateOrientation);
    }

    return () => {
      if (typeof window !== 'undefined' && screen.orientation) {
        screen.orientation.removeEventListener('change', updateOrientation);
      } else if (typeof window !== 'undefined') {
        window.removeEventListener('orientationchange', updateOrientation);
        window.removeEventListener('resize', updateOrientation);
      }
    };
  }, []);

  return { isMobilePortrait };
};
