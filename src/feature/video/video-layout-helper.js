import { VideoQuality } from '@zoom/videosdk';

const layoutCandidates = Array.from({ length: 9 })
  .map((value, index) => {
    const count = index + 1;
    const mid = Math.ceil(count / 2);
    const candidates = Array.from({ length: mid })
      .map((v, i) => {
        const row = i + 1;
        const column = Math.ceil(count / row);
        if (row < column) {
          return [
            { row, column },
            { row: column, column: row }
          ];
        }
        if (row === column) {
          return [{ row, column }];
        }
        return [];
      })
      .reduce((prev, curr) => [...prev, ...curr], []);
    return { count, candidates };
  })
  .reduce((prev, curr) => ({ ...prev, [curr.count]: curr.candidates }), {});

const aspectRatio = 16 / 9;
const minCellWidth = 256;
const minCellHeight = minCellWidth / aspectRatio;

function isSupportWebCodecs() {
  return typeof MediaStreamTrackProcessor === 'function';
}

export function maxViewportVideoCounts(width, height) {
  const maxRowCount = Math.floor(height / minCellHeight);
  const maxColumnCount = Math.floor(width / minCellWidth);
  return Math.min(maxRowCount * maxColumnCount, 9);
}

export function getVideoLayout(containerWidth, containerHeight, numberOfCells) {
  let layout = { cellWidth: 0, cellHeight: 0, cellArea: 0, column: 1, row: 1 };
  const candidates = layoutCandidates[numberOfCells];
  
  candidates.forEach((item) => {
    const { row, column } = item;
    const cellWidth = Math.floor(containerWidth / column);
    const cellHeight = Math.floor(containerHeight / row);
    const cellArea = cellWidth * cellHeight;
    if (cellArea > layout.cellArea) {
      layout = { cellWidth, cellHeight, cellArea, column, row };
    }
  });

  const { cellWidth, cellHeight, column } = layout;
  const cells = [];
  for (let i = 0; i < numberOfCells; i += 1) {
    cells.push({
      width: cellWidth,
      height: cellHeight,
      x: (i % column) * cellWidth,
      y: Math.floor(i / column) * cellHeight,
      quality: isSupportWebCodecs() ? VideoQuality.Video_360P : VideoQuality.Video_90P
    });
  }
  return cells;
}

export function getVideoLayoutForAttach(containerWidth, containerHeight, numberOfCells) {
  let layout = { cellWidth: 0, cellHeight: 0, cellArea: 0, column: 1, row: 1 };
  const candidates = layoutCandidates[numberOfCells];
  
  candidates.forEach((item) => {
    const { row, column } = item;
    const cellWidth = Math.floor(containerWidth / column);
    const cellHeight = Math.floor(containerHeight / row);
    const cellArea = cellWidth * cellHeight;
    if (cellArea > layout.cellArea) {
      layout = { cellWidth, cellHeight, cellArea, column, row };
    }
  });

  const { cellWidth, cellHeight, column } = layout;
  const cells = [];
  for (let i = 0; i < numberOfCells; i += 1) {
    cells.push({
      width: cellWidth,
      height: cellHeight,
      x: (i % column) * cellWidth,
      y: Math.floor(i / column) * cellHeight
    });
  }
  return cells;
}
