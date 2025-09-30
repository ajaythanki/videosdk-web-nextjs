#!/bin/bash

# Script to remove old TypeScript files that have been converted to JavaScript

echo "Removing old TypeScript files that have JavaScript equivalents..."

# Files that have been converted
rm -f src/App.tsx
rm -f src/component/audio-animation-icon.tsx
rm -f src/component/icon-font.tsx
rm -f src/component/loading-layer.tsx
rm -f src/feature/chat/chat.tsx
rm -f src/feature/chat/component/chat-file-message-item.tsx
rm -f src/feature/chat/component/chat-image-message-item.tsx
rm -f src/feature/chat/component/chat-message-item.tsx
rm -f src/feature/chat/component/chat-receiver.tsx
rm -f src/feature/command/command.tsx
rm -f src/feature/command/component/cmd-message-item.tsx
rm -f src/feature/command/component/cmd-receiver.tsx
rm -f src/feature/home/home.tsx
rm -f src/feature/preview/preview.tsx
rm -f src/feature/video/components/avatar.tsx
rm -f src/feature/video/components/avatar-more.tsx
rm -f src/feature/video/components/camera.tsx
rm -f src/feature/video/components/leave.tsx
rm -f src/feature/video/components/microphone.tsx
rm -f src/feature/video/components/pagination.tsx
rm -f src/feature/video/components/remote-camera-control.tsx
rm -f src/feature/video/components/report-btn.tsx
rm -f src/feature/video/components/screen-share.tsx
rm -f src/feature/video/components/share-view/share-view.tsx
rm -f src/feature/video/components/share-view/single-share-view.tsx
rm -f src/feature/video/components/share-view/multi-share-view.tsx
rm -f src/feature/video/video.tsx
rm -f src/feature/video/video-single.tsx

# TypeScript type files and hooks
rm -f src/feature/video/hooks/useAudioLevel.ts
rm -f src/feature/video/hooks/useAvtiveVideo.ts
rm -f src/feature/video/hooks/useAvatarAction.ts
rm -f src/feature/video/hooks/useCameraControl.ts
rm -f src/feature/video/hooks/useCanvasDimension.ts
rm -f src/feature/video/hooks/useCleanUp.ts
rm -f src/feature/video/hooks/useGalleryLayout.ts
rm -f src/feature/video/hooks/useNetworkQuality.ts
rm -f src/feature/video/hooks/usePagination.ts
rm -f src/feature/video/hooks/useParticipantsChange.ts
rm -f src/feature/video/hooks/useRenderVideo.ts
rm -f src/feature/video/hooks/useShare.ts
rm -f src/feature/video/hooks/useRemoteControl.ts
rm -f src/feature/video/hooks/useMultiShare.ts
rm -f src/feature/video/hooks/useSpotlightVideo.ts
rm -f src/feature/video/video-constants.ts
rm -f src/feature/video/video-layout-helper.ts
rm -f src/feature/video/context/avatar-context.ts

# Chat hooks
rm -f src/feature/chat/hooks/useChat.ts
rm -f src/feature/chat/hooks/useParticipantsChange.ts
rm -f src/feature/chat/chat-utils.ts

# Command hooks
rm -f src/feature/command/hooks/useParticipantsChange.ts

# Core hooks
rm -f src/hooks/useAnimationFrame.ts
rm -f src/hooks/useBackHome.ts
rm -f src/hooks/useDebounceFn.ts
rm -f src/hooks/useDragDrop.ts
rm -f src/hooks/useEventListener.ts
rm -f src/hooks/useHover.ts
rm -f src/hooks/useMount.ts
rm -f src/hooks/useOrientation.ts
rm -f src/hooks/usePersistFn.ts
rm -f src/hooks/usePrevious.ts
rm -f src/hooks/useSizeCallback.ts
rm -f src/hooks/useUnmount.ts

# Context files
rm -f src/context/zoom-context.ts
rm -f src/context/media-context.ts

# Config files
rm -f src/config/dev.ts

# Utility files
rm -f src/utils/util.ts
rm -f src/utils/platform.ts

echo "Cleanup complete!"
echo "Old TypeScript files have been removed."
