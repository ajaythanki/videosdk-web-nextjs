'use client';

import { forwardRef } from 'react';

const ShareBar = forwardRef((props, ref) => {
  const { viewType, setViewType, isControllingUser, controllingUser } = props;
  
  return (
    <div className="share-bar" ref={ref}>
      {/* Share bar controls */}
    </div>
  );
});

ShareBar.displayName = 'ShareBar';

export default ShareBar;
