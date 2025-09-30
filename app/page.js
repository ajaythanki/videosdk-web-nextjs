'use client';

import { useContext, useCallback, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Home from '../src/feature/home/home';
import ZoomContext from '../src/context/zoom-context';
import { Toast, ToastContainer } from 'react-bootstrap';

export default function HomePage() {
  const zmClient = useContext(ZoomContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('closed');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ type: 'info', text: '' });

  const showNotification = (type, text) => {
    setToastMessage({ type, text });
    setShowToast(true);
  };

  const onLeaveOrJoinSession = useCallback(async () => {
    if (!zmClient) return;

    if (status === 'closed') {
      // Rejoin logic would go here
      const urlParams = new URLSearchParams(window.location.search);
      const args = Object.fromEntries(urlParams);
      
      try {
        await zmClient.join(args.topic, args.signature, args.name, args.password);
        setStatus('connected');
      } catch (e) {
        showNotification('danger', 'Failed to join session');
      }
    } else if (status === 'connected') {
      await zmClient.leave();
      setStatus('closed');
      showNotification('warning', 'You have left the session.');
    }
  }, [zmClient, status]);

  useEffect(() => {
    if (!zmClient) return;

    const onConnectionChange = (payload) => {
      if (payload.state === 'Connected') {
        setStatus('connected');
      } else if (payload.state === 'Closed' || payload.state === 'Fail') {
        setStatus('closed');
      }
    };

    zmClient.on('connection-change', onConnectionChange);

    return () => {
      zmClient.off('connection-change', onConnectionChange);
    };
  }, [zmClient]);

  return (
    <>
      <Home status={status} onLeaveOrJoinSession={onLeaveOrJoinSession} />
      <ToastContainer position="top-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg={toastMessage.type}>
          <Toast.Header>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body className={toastMessage.type === 'danger' || toastMessage.type === 'warning' ? 'text-white' : ''}>
            {toastMessage.text}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}
