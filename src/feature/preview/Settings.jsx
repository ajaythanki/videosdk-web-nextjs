import React, { useEffect, useRef, useState } from 'react';
import './preview.css';

// Local storage key
const VB_STORAGE_KEY = 'zoom_virtual_background_selection';

const Settings = ({
  setBackgroundOption,
  cameraDevices,
  audioDevices,
  selectedCameraIndex,
  setSelectedCameraIndex,
  selectedMikeIndex,
  setSelectedMikeIndex,
  handleSettingsClick,
  localVideoTrack,
  setIsVideoOn,
  isVideoOn,
  VB_BACKGROUNDS,
}) => {
  const [appliedBackground, setAppliedBackground] = useState('none');
  const [selectedBackground, setSelectedBackground] = useState('none');
  const [isApplying, setIsApplying] = useState(false);

  // Initialize background selection from local storage on component mount
  useEffect(() => {
    const savedBackground = localStorage.getItem(VB_STORAGE_KEY) || 'none';
    setAppliedBackground(savedBackground);
    setSelectedBackground(savedBackground);
    updateBackgroundOption(savedBackground);
  }, []);

  const updateBackgroundOption = backgroundId => {
    if (backgroundId === 'blur') {
      setBackgroundOption('blur');
    } else if (backgroundId === 'none') {
      setBackgroundOption('none');
    } else {
      setBackgroundOption('custom');
    }
    localStorage.setItem(VB_STORAGE_KEY, backgroundId);
  };

  const handleBackgroundSelect = backgroundId => {
    console.log('Background selected:', backgroundId);
    setSelectedBackground(backgroundId);
  };

  const handleApplyBackground = async () => {
    if (isApplying) return;

    console.log('Applying background:', selectedBackground);
    setIsApplying(true);

    try {
      // Save the selection
      setAppliedBackground(selectedBackground);
      updateBackgroundOption(selectedBackground);

      // Configure background options
      let options = {};
      if (selectedBackground === 'blur') {
        options = { imageUrl: 'blur' };
      } else if (selectedBackground !== 'none') {
        const selectedBg = VB_BACKGROUNDS.find(
          bg => bg.id === selectedBackground
        );
        if (selectedBg && selectedBg.url) {
          options = { imageUrl: selectedBg.url };
        }
      }

      // Store the background options
      localStorage.setItem(
        'zoom_virtual_background_selection',
        selectedBackground
      );
      localStorage.setItem(
        'zoom_virtual_background_options',
        JSON.stringify(options)
      );

      // If video is currently on, we need to restart it with the new background
      if (isVideoOn && localVideoTrack) {
        const videoElement = document.getElementById('local-preview-video');
        if (!videoElement) {
          console.error('Main video element not found');
          return;
        }

        try {
          console.log('Stopping video...');
          // First, stop the video completely
          await localVideoTrack.stop();

          // Clear the video element
          const videoPlayerContainer = videoElement.parentElement;
          if (videoPlayerContainer) {
            videoPlayerContainer.innerHTML = '';

            // Create a new video-player element
            const newVideoPlayer = document.createElement('video-player');
            newVideoPlayer.id = 'local-preview-video';
            videoPlayerContainer.appendChild(newVideoPlayer);
          }

          // Wait for cleanup
          await new Promise(resolve => setTimeout(resolve, 800));

          console.log('Starting video with options:', options);

          // Get the new video element
          const newVideoElement = document.getElementById(
            'local-preview-video'
          );

          // Start video with new background
          if (selectedBackground === 'none') {
            // No background
            await localVideoTrack.start(newVideoElement);
          } else if (selectedBackground === 'blur') {
            // Blur background
            await localVideoTrack.start(newVideoElement, { imageUrl: 'blur' });
          } else {
            // Custom background
            await localVideoTrack.start(newVideoElement, options);
          }

          console.log('Video restarted with new background successfully');

          // Update the video state in parent component
          setIsVideoOn(true);
          localStorage.setItem('isVideoOn', 'true');
        } catch (error) {
          console.error('Error applying background:', error);

          // Try to restore video without background
          try {
            const videoElement = document.getElementById('local-preview-video');
            if (videoElement) {
              await localVideoTrack.start(videoElement);
              setIsVideoOn(true);
              localStorage.setItem('isVideoOn', 'true');
            }
          } catch (restoreError) {
            console.error('Failed to restore video:', restoreError);
            setIsVideoOn(false);
            localStorage.setItem('isVideoOn', 'false');
          }
        }
      }
    } finally {
      setIsApplying(false);
    }
  };
  const handleCancelBackgroundSelection = () => {
    console.log('Cancelling background selection');
    setSelectedBackground(appliedBackground);
  };

  const handleCameraChange = event => {
    setSelectedCameraIndex(event.target.value);
  };

  const handleMikeChange = event => {
    setSelectedMikeIndex(event.target.value);
  };

  return (
    <div className="settings-dialog-box ms-xl-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <p className="dialog-title fw-bold mb-0">Settings</p>
        </div>
        <div>
          <button
            className="btn-close"
            onClick={() => handleSettingsClick(false)}
            aria-label="Close"></button>
        </div>
      </div>

      <div className="title-bar"></div>

      <div className="mt-4">
        <h6 className="mb-3 fw-bold">Devices</h6>

        <div className="mb-3">
          <label
            htmlFor="cameraSelect"
            className="form-label small text-muted mb-1">
            Camera
          </label>
          <select
            id="cameraSelect"
            className="form-select custom-select"
            value={selectedCameraIndex}
            onChange={handleCameraChange}>
            {cameraDevices?.map((device, index) => (
              <option
                key={index}
                value={index}>
                {device?.label || `Camera ${index + 1}`}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label
            htmlFor="microphoneSelect"
            className="form-label small text-muted mb-1">
            Microphone
          </label>
          <select
            id="microphoneSelect"
            className="form-select custom-select"
            value={selectedMikeIndex}
            onChange={handleMikeChange}>
            {audioDevices?.map((device, index) => (
              <option
                key={index}
                value={index}>
                {device?.label || `Microphone ${index + 1}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <h6 className="mb-3 fw-bold">Virtual Backgrounds</h6>

        {/* Simple preview text instead of video preview */}
        <div className="mb-3">
          <p className="small text-muted mb-1">
            Current background:{' '}
            {appliedBackground === 'none'
              ? 'No Background'
              : appliedBackground === 'blur'
                ? 'Blur'
                : VB_BACKGROUNDS.find(bg => bg.id === appliedBackground)
                    ?.name || 'Custom'}
          </p>
          {selectedBackground !== appliedBackground && (
            <p className="small text-info">
              Preview:{' '}
              {selectedBackground === 'none'
                ? 'No Background'
                : selectedBackground === 'blur'
                  ? 'Blur'
                  : VB_BACKGROUNDS.find(bg => bg.id === selectedBackground)
                      ?.name || 'Custom'}
            </p>
          )}
        </div>

        <div className="virtual-background-grid">
          {VB_BACKGROUNDS.map(background => (
            <div
              key={background.id}
              className={`background-item ${selectedBackground === background.id ? 'selected' : ''}`}
              onClick={() => handleBackgroundSelect(background.id)}>
              {background.url ? (
                background.url === 'blur' ? (
                  <div className="blur-preview">
                    <span>Blur</span>
                  </div>
                ) : (
                  <div
                    className="background-preview"
                    style={{ backgroundImage: `url(${background.url})` }}
                  />
                )
              ) : (
                <div className="no-background">
                  <span>None</span>
                </div>
              )}
              <div className="background-name">{background.name}</div>
            </div>
          ))}
        </div>

        {/* Background selection action buttons */}
        <div className="d-flex justify-content-end mt-3">
          <button
            className="btn btn-outline-secondary me-2"
            onClick={handleCancelBackgroundSelection}
            disabled={selectedBackground === appliedBackground || isApplying}>
            Cancel
          </button>
          <button
            className="btn btn-primary color-strong-voilet border-0"
            onClick={handleApplyBackground}
            disabled={selectedBackground === appliedBackground || isApplying}>
            {isApplying ? 'Applying...' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;