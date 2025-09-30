/* eslint-disable no-restricted-globals */
'use client';

import { useRouter } from 'next/navigation';
import { Card, Button } from 'react-bootstrap';
import { IconFont } from '../../component/icon-font';
import './home.scss';

const Home = (props) => {
  const { status, onLeaveOrJoinSession } = props;
  const router = useRouter();
  
  const onCardClick = (type) => {
    const searchParams = typeof window !== 'undefined' ? window.location.search : '';
    router.push(`/${type}${searchParams}`);
  };

  const featureList = [
    {
      key: 'video',
      icon: 'icon-meeting',
      title: 'Audio, video and share',
      description: 'Gallery Layout, Start/Stop Audio, Mute/Unmute, Start/Stop Video, Start/Stop Screen Share'
    },
    {
      key: 'chat',
      icon: 'icon-chat',
      title: 'Session chat',
      description: 'Session Chat, Chat Priviledge'
    },
    {
      key: 'command',
      icon: 'icon-chat',
      title: 'Command Channel chat',
      description: 'Session Command Channel chat'
    },
    {
      key: 'subsession',
      icon: 'icon-group',
      title: 'Subsession',
      description: 'Open/Close Subsession, Assign/Move Participants into Subsession, Join/Leave Subsession'
    },
    {
      key: 'preview',
      icon: 'icon-meeting',
      title: 'Local Preview',
      description: 'Audio and Video preview'
    }
  ];

  let actionText;
  if (status === 'connected') {
    actionText = 'Leave';
  } else if (status === 'closed') {
    actionText = 'Join';
  }

  return (
    <div>
      <div className="nav">
        <a href="/" className="navhome">
          <img src="./logo.svg" alt="Home" />
          <span>VideoSDK Demo</span>
        </a>
        <div className="navdoc">
          <a href="https://marketplace.zoom.us/docs/sdk/video/web/reference" target="_blank" rel="noreferrer">
            <span>API Reference</span>
          </a>
          <a href="https://marketplace.zoom.us/docs/sdk/video/web/build/sample-app" target="_blank" rel="noreferrer">
            <span>Doc</span>
          </a>
        </div>
        {actionText && (
          <Button variant="link" className="navleave" onClick={onLeaveOrJoinSession}>
            {actionText}
          </Button>
        )}
      </div>

      <div className="home">
        <h1>Zoom Video SDK feature</h1>
        <div className="feature-entry">
          {featureList.map((feature) => {
            const { key, icon, title, description } = feature;
            return (
              <Card
                key={key}
                className="entry-item"
                style={{ width: 320, cursor: 'pointer' }}
                onClick={() => onCardClick(key)}
              >
                <Card.Body className="text-center">
                  <IconFont style={{ fontSize: '72px' }} type={icon} />
                  <Card.Title className="mt-3">{title}</Card.Title>
                  <Card.Text>{description}</Card.Text>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
