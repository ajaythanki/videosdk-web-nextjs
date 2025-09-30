'use client';

import { BsInfoCircle } from 'react-icons/bs';
import { Button, Modal, ListGroup, Toast, ToastContainer } from 'react-bootstrap';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ZoomVideo, { BroadcastStreamingStatus } from '@zoom/videosdk';
import ZoomContext from '../../../context/zoom-context';
import './report-btn.scss';

const trackingId = typeof window !== 'undefined' ? Object.fromEntries(new URLSearchParams(window.location.search))?.customerJoinId : undefined;

const ReportBtn = () => {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const zmClient = useContext(ZoomContext);
  const [channelId, setChannelId] = useState(
    zmClient.getBroadcastStreamingClient().getBroadcastStreamingStatus()?.channelId
  );
  
  const onChannelIdChange = useCallback(
    ({ status }) => {
      if (status === BroadcastStreamingStatus.InProgress) {
        const state = zmClient.getBroadcastStreamingClient().getBroadcastStreamingStatus();
        setChannelId(state.channelId);
      } else {
        setChannelId('');
      }
    },
    [zmClient]
  );
  
  useEffect(() => {
    zmClient.on('broadcast-streaming-status', onChannelIdChange);
    return () => {
      zmClient.off('broadcast-streaming-status', onChannelIdChange);
    };
  }, [zmClient, onChannelIdChange]);

  const data = useMemo(() => [
    {
      label: 'Video SDK version',
      value: ZoomVideo.VERSION
    },
    {
      label: 'JsMedia version',
      value: typeof window !== 'undefined' ? window.JsMediaSDK_Instance?.version : ''
    },
    {
      label: 'SharedArrayBuffer',
      value: `${typeof window !== 'undefined' ? window.crossOriginIsolated : false}`
    },
    {
      label: 'Session id(mid)',
      value: zmClient.getSessionInfo().sessionId
    },
    {
      label: 'Telemetry tracking id',
      value: trackingId ? window.atob(trackingId) : ''
    },
    {
      label: 'Broadcast streaming channel id',
      value: channelId || 'N/A'
    }
  ], [zmClient, channelId]);
  
  const handleReportLog = async () => {
    try {
      await zmClient.getLoggerClient().reportToGlobalTracing();
      setShowToast(true);
      setShowModal(false);
    } catch (error) {
      console.error('Failed to report log:', error);
    }
  };
  
  return (
    <>
      <Button
        variant="light"
        className="report-info"
        onClick={() => setShowModal(true)}
        style={{ borderRadius: '50%', padding: '8px' }}
      >
        <BsInfoCircle />
      </Button>
      
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Session Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup variant="flush">
            {data.map((item, index) => (
              <ListGroup.Item key={index} className="d-flex justify-content-between align-items-start">
                <div className="fw-bold me-3">{item.label}:</div>
                <div className="text-end">{item.value || 'N/A'}</div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleReportLog}>
            Report Log
          </Button>
        </Modal.Footer>
      </Modal>
      
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast 
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={3000} 
          autohide
          bg="success"
        >
          <Toast.Header closeButton>
            <strong className="me-auto">Success</strong>
          </Toast.Header>
          <Toast.Body>Successfully reported the log.</Toast.Body>
        </Toast>
      </ToastContainer>
    </>);
};

export default ReportBtn;
