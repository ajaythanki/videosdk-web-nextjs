import { useState } from 'react';
import { useParticipantsChange } from './useParticipantsChange';

export function usePagination(zmClient, preferVideoCount) {
  let pageSize = preferVideoCount;
  const [page, setPage] = useState(0);
  const [totalSize, setTotalSize] = useState(0);

  useParticipantsChange(zmClient, (allParticipants) => {
    setTotalSize(allParticipants.length - 1);
  });

  return {
    page,
    totalPage: Math.ceil(totalSize / pageSize),
    pageSize,
    totalSize,
    setPage
  };
}
