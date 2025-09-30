/* eslint-disable no-nested-ternary */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Tooltip, Dropdown, Button, Modal, OverlayTrigger } from 'react-bootstrap';
import classNames from 'classnames';
import { 
  BsCheck, 
  BsChevronUp, 
  BsTelephone, 
  BsTelephoneX, 
  BsMic, 
  BsMicMute, 
  BsHeadset,
  BsHeadsetVr
} from 'react-icons/bs';
import { IconFont } from '../../../component/icon-font';
import { AudoiAnimationIcon } from '../../../component/audio-animation-icon';
import { useAudioLevel } from '../hooks/useAudioLevel';

const MicrophoneButton = (props) => {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showCrcModal, setShowCrcModal] = useState(false);
  
  const {
    isStartedAudio,
    isSupportPhone,
    isMuted,
    audio,
    className,
    microphoneList = [],
    speakerList = [],
    activeMicrophone,
    activeSpeaker,
    disabled,
    isMicrophoneForbidden,
    isSecondaryAudioStarted,
    isPreview,
    onMicrophoneClick,
    onMicrophoneMenuClick,
    activeAudioProcessorList = [],
    isSupportAudioProcessor,
    audioProcessorList = []
  } = props;
  
  const level = useAudioLevel();
  
  const tooltipText = isStartedAudio ? (isMuted ? 'Unmute' : 'Mute') : 'Start audio';
  
  const renderMicrophoneMenu = useMemo(() => {
    const items = [];

    // Microphone selection
    if (microphoneList?.length > 0 && audio !== 'phone') {
      items.push(
        <div key="mic-header" className="dropdown-header">Select a Microphone</div>,
        ...microphoneList.map((item) => (
          <Dropdown.Item 
            key={`microphone|${item.deviceId}`}
            onClick={() => onMicrophoneMenuClick(`microphone|${item.deviceId}`)}
            className="d-flex justify-content-between align-items-center"
          >
            {item.label}
            {activeMicrophone === item.deviceId && <BsCheck />}
          </Dropdown.Item>
        )),
        <Dropdown.Divider key="mic-divider" />
      );
    }
    
    // Speaker selection
    if (speakerList?.length > 0 && audio !== 'phone') {
      items.push(
        <div key="speaker-header" className="dropdown-header">Select a Speaker</div>,
        ...speakerList.map((item) => (
          <Dropdown.Item 
            key={`speaker|${item.deviceId}`}
            onClick={() => onMicrophoneMenuClick(`speaker|${item.deviceId}`)}
            className="d-flex justify-content-between align-items-center"
          >
            {item.label}
            {activeSpeaker === item.deviceId && <BsCheck />}
          </Dropdown.Item>
        )),
        <Dropdown.Divider key="speaker-divider" />
      );
    }
    
    // Audio processors
    if (!isPreview && isSupportAudioProcessor && audioProcessorList?.length > 0) {
      items.push(
        <div key="processor-header" className="dropdown-header">Select an Audio Processor</div>,
        ...audioProcessorList.map((item) => (
          <Dropdown.Item 
            key={`processor|${item.name}`}
            onClick={() => onMicrophoneMenuClick(`processor|${item.name}`)}
            className="d-flex justify-content-between align-items-center"
          >
            {item.name}
            {activeAudioProcessorList?.some(p => p.name === item.name) && <BsCheck />}
          </Dropdown.Item>
        )),
        <Dropdown.Divider key="processor-divider" />
      );
    }
    
    // Secondary audio
    if (!isPreview) {
      items.push(
        <Dropdown.Item 
          key="secondary-audio"
          onClick={() => onMicrophoneMenuClick('secondary audio')}
        >
          {isSecondaryAudioStarted ? 'Stop Secondary Audio' : 'Start Secondary Audio'}
        </Dropdown.Item>,
        <Dropdown.Divider key="secondary-audio-divider" />
      );
    }
    
    // Audio statistic
    if (!isPreview && audio !== 'phone') {
      items.push(
        <Dropdown.Item 
          key="statistic"
          onClick={() => onMicrophoneMenuClick('statistic')}
        >
          Audio Statistic
        </Dropdown.Item>,
        <Dropdown.Divider key="statistic-divider" />
      );
    }
    
    // Leave audio/hangup
    items.push(
      <Dropdown.Item 
        key="leave-audio"
        onClick={() => onMicrophoneMenuClick(audio === 'phone' ? 'hangup' : 'leave audio')}
        className={audio === 'phone' ? 'text-danger' : ''}
      >
        {audio === 'phone' ? 'Hang Up' : 'Leave Audio'}
      </Dropdown.Item>
    );
    
    return items;
  }, [
    microphoneList,
    speakerList,
    audioProcessorList,
    activeMicrophone,
    activeSpeaker,
    activeAudioProcessorList,
    isPreview,
    isSupportAudioProcessor,
    isSecondaryAudioStarted,
    audio,
    onMicrophoneMenuClick
  ]);

  const onPhoneMenuClick = (key) => {
    if (key === 'phone') {
      setShowPhoneModal(true);
    } else if (key === 'crc') {
      setShowCrcModal(true);
    } else if (key?.indexOf('processor|') > -1) {
      onMicrophoneMenuClick(key);
    }
  };

  const audioIcon = useMemo(() => {
    let iconType = '';
    if (isStartedAudio) {
      if (isMuted) {
        if (audio === 'phone') {
          iconType = 'icon-phone-off';
        } else {
          iconType = 'icon-audio-muted';
        }
      } else {
        if (audio === 'phone') {
          iconType = 'icon-phone';
        } else {
          if (level !== 0) {
            return <AudoiAnimationIcon level={level} />;
          } else {
            iconType = 'icon-audio-unmuted';
          }
        }
      }
    } else {
      if (isMicrophoneForbidden) {
        iconType = 'icon-audio-disallow';
      } else {
        iconType = 'icon-headset';
      }
    }
    if (iconType) {
      return <IconFont type={iconType} style={{ width: '20px', height: '20px' }} />;
    }
  }, [level, audio, isMuted, isMicrophoneForbidden, isStartedAudio]);
  
  useEffect(() => {
    if (isStartedAudio) {
      setShowPhoneModal(false);
    }
  }, [isStartedAudio]);
  
  const renderButtonContent = useMemo(() => (
    <div className="d-flex align-items-center">
      {audioIcon}
      {isStartedAudio && <BsChevronUp className="ms-1" size={12} />}
    </div>
  ), [audioIcon, isStartedAudio]);

  return (
    <div className={classNames('microphone-footer', className)}>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>{tooltipText}</Tooltip>}
      >
        <div>
          {isStartedAudio ? (
            <Dropdown drop="up" align="end">
              <Dropdown.Toggle
                as={Button}
                variant="light"
                className={classNames('vc-button', 'p-2', 'd-flex', 'align-items-center', 'justify-content-center', {
                  'started-audio': isStartedAudio,
                  'muted': isMuted,
                  'disabled': disabled
                })}
                onClick={onMicrophoneClick}
                disabled={disabled}
                style={{ width: '20px', height: '20px' }}
              >
                {renderButtonContent}
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-end">
                {renderMicrophoneMenu}
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <div>
              {isSupportPhone || isSupportAudioProcessor ? (
                <Dropdown drop="up" align="end">
                  <Dropdown.Toggle
                    as={Button}
                    variant="light"
                    className={classNames('vc-button', 'p-2', 'd-flex', 'align-items-center', 'justify-content-center', {
                      'start-audio': !isStartedAudio,
                      'disabled': disabled
                    })}
                    onClick={onMicrophoneClick}
                    disabled={disabled}
                    style={{ width: '20px', height: '20px' }}
                  >
                    {renderButtonContent}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="dropdown-menu-end">
                    {isSupportPhone && (
                      <>
                        <Dropdown.Item eventKey="phone" onClick={() => onPhoneMenuClick('phone')}>
                          <div className="d-flex align-items-center">
                            <BsTelephone className="me-2" />
                            Invite by Phone
                          </div>
                        </Dropdown.Item>
                        <Dropdown.Item eventKey="crc" onClick={() => onPhoneMenuClick('crc')}>
                          <div className="d-flex align-items-center">
                            <BsTelephoneX className="me-2" />
                            Invite H323/SIP Room
                          </div>
                        </Dropdown.Item>
                        <Dropdown.Divider />
                      </>
                    )}
                    {isSupportAudioProcessor && audioProcessorList?.length > 0 && (
                      <>
                        <div className="dropdown-header">Select an Audio Processor</div>
                        {audioProcessorList.map((item) => (
                          <Dropdown.Item 
                            key={`processor|${item.name}`}
                            onClick={() => onPhoneMenuClick(`processor|${item.name}`)}
                            className="d-flex justify-content-between align-items-center"
                          >
                            {item.name}
                            {activeAudioProcessorList?.some(p => p.name === item.name) && <BsCheck />}
                          </Dropdown.Item>
                        ))}
                      </>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Button
                  variant="light"
                  className={classNames('vc-button', 'ajay', 'p-2', 'd-flex', 'align-items-center', 'justify-content-center', {
                    'start-audio': !isStartedAudio,
                    'disabled': disabled
                  })}
                  onClick={onMicrophoneClick}
                  disabled={disabled}
                  style={{ width: '20px', height: '20px' }}
                >
                  {renderButtonContent}
                </Button>
              )}
            </div>
          )}
        </div>
      </OverlayTrigger>
      
      {/* Phone Call Modal */}
      <Modal show={showPhoneModal} onHide={() => setShowPhoneModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Phone Call</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Phone call functionality would be implemented here
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPhoneModal(false)}>
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              // Handle phone call start
              setShowPhoneModal(false);
            }}
          >
            Start Call
          </Button>
        </Modal.Footer>
      </Modal>

      {/* H323/SIP Room Modal */}
      <Modal show={showCrcModal} onHide={() => setShowCrcModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>H323/SIP Room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          H323/SIP Room functionality would be implemented here
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCrcModal(false)}>
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              // Handle H323/SIP Room join
              setShowCrcModal(false);
            }}
          >
            Join Room
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MicrophoneButton;
