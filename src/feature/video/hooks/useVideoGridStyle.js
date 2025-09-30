import { useCallback } from 'react';
import { useScreenOrientation } from './useScreenOrientation';

export const useVideoGridStyle = ({ currentPageParticipants }) => {
  const { isMobilePortrait } = useScreenOrientation();

  const getVideoGridStyle = useCallback(
    (index) => {
      const userCount = currentPageParticipants.length;

      if (isMobilePortrait) {
        if (userCount % 2 === 1 && index === userCount - 1) {
          return { gridColumn: '1 / -1', justifySelf: 'center' };
        }
        return {};
      }

      if (userCount === 3 && index === 2) {
        return { gridColumn: '1 / -1', justifySelf: 'center' };
      }

      if (userCount === 5 && index >= 3) {
        const positionInLastRow = index - 3;
        return {
          gridColumn: positionInLastRow === 0 ? '1 / 2' : '2 / 3',
          justifySelf: 'center',
          gridRow: '2'
        };
      }

      if (userCount === 6 && index >= 3) {
        return {};
      }

      if (userCount === 7 && index === 6) {
        return { gridColumn: '1 / -1', justifySelf: 'center' };
      }

      if (userCount === 8 && index >= 6) {
        const positionInLastRow = index - 6;
        return {
          gridColumn: positionInLastRow === 0 ? '1 / 2' : '2 / 3',
          justifySelf: 'center',
          gridRow: '3'
        };
      }

      if (userCount === 10 && index === 9) {
        return { gridColumn: '1 / -1', justifySelf: 'center' };
      }

      if (userCount === 11 && index >= 8) {
        const positionInLastRow = index - 8;
        return {
          gridColumn: `${positionInLastRow + 1} / ${positionInLastRow + 2}`,
          justifySelf: 'center',
          gridRow: '3'
        };
      }

      if (userCount === 13 && index === 12) {
        return { gridColumn: '1 / -1', justifySelf: 'center' };
      }

      if (userCount === 14 && index >= 12) {
        const positionInLastRow = index - 12;
        return {
          gridColumn: positionInLastRow === 0 ? '1 / 3' : '3 / 5',
          justifySelf: 'center',
          gridRow: '4'
        };
      }

      if (userCount === 15 && index >= 12) {
        const positionInLastRow = index - 12;
        return {
          gridColumn: `${positionInLastRow + 1} / ${positionInLastRow + 2}`,
          justifySelf: 'center',
          gridRow: '4'
        };
      }

      if (userCount === 17 && index === 16) {
        return { gridColumn: '1 / -1', justifySelf: 'center' };
      }

      if (userCount === 18 && index >= 15) {
        const positionInLastRow = index - 15;
        return {
          gridColumn: `${positionInLastRow + 1} / ${positionInLastRow + 2}`,
          justifySelf: 'center',
          gridRow: '4'
        };
      }

      if (userCount === 19 && index >= 15) {
        const positionInLastRow = index - 15;
        return {
          gridColumn: `${positionInLastRow + 1} / ${positionInLastRow + 2}`,
          justifySelf: 'center',
          gridRow: '4'
        };
      }

      if (userCount === 21 && index === 20) {
        return { gridColumn: '1 / -1', justifySelf: 'center' };
      }

      if (userCount === 22 && index >= 20) {
        const positionInLastRow = index - 20;
        return {
          gridColumn: positionInLastRow === 0 ? '1 / 3' : '3 / 5',
          justifySelf: 'center',
          gridRow: '5'
        };
      }

      if (userCount === 23 && index >= 20) {
        const positionInLastRow = index - 20;
        return {
          gridColumn: `${positionInLastRow + 1} / ${positionInLastRow + 2}`,
          justifySelf: 'center',
          gridRow: '5'
        };
      }

      if (userCount === 24 && index >= 20) {
        const positionInLastRow = index - 20;
        return {
          gridColumn: `${positionInLastRow + 1} / ${positionInLastRow + 2}`,
          justifySelf: 'center',
          gridRow: '5'
        };
      }

      return {};
    },
    [currentPageParticipants.length, isMobilePortrait]
  );

  return { getVideoGridStyle };
};
