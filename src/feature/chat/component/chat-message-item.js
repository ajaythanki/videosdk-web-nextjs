'use client';

import { useCallback } from 'react';
import { BsPerson } from 'react-icons/bs';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import ChatFileMessageItem from './chat-file-message-item';
import './chat-message-item.scss';

const ChatMessageItem = (props) => {
  const { record, currentUserId, setChatUser, resendFile, downloadFile } = props;
  const { message, file, sender, receiver, timestamp } = record;
  const { avatar } = sender;
  const isCurrentUser = currentUserId === sender.userId;
  
  const onAvatarClick = useCallback(() => {
    if (!isCurrentUser) {
      setChatUser(sender.userId);
    }
  }, [isCurrentUser, sender, setChatUser]);
  
  const chatMessage = Array.isArray(message) ? message : [message];
  
  return (
    <div className={classNames('chat-message-item', { myself: isCurrentUser })}>
      <Button className="chat-message-avatar" onClick={onAvatarClick} variant="outline-secondary" style={{ borderRadius: '50%', width: '40px', height: '40px' }}>
        {avatar ? <img src={avatar} className="chat-message-avatar-img" alt="" /> : <BsPerson />}
      </Button>
      <div className="chat-message-content">
        <div className={classNames('chat-message-info', { myself: isCurrentUser })}>
          <p className="chat-message-receiver">
            {isCurrentUser ? '' : sender.name}
            <span>To</span>
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                setChatUser(receiver.userId);
              }}
            >
              {receiver.userId === currentUserId ? 'me' : receiver.name}
            </a>
          </p>
          <p className="chat-message-time">{new Date(timestamp).toLocaleTimeString()}</p>
        </div>
        {file ? (
          <ChatFileMessageItem
            className={classNames({ myself: isCurrentUser })}
            file={file}
            id={record.id}
            resendFile={resendFile}
            downloadFile={downloadFile}
          />
        ) : (
          <ul className={classNames('chat-message-text-list', { myself: isCurrentUser })}>
            {chatMessage.map((text, index) => (
              <li className={classNames('chat-message-text')} key={index}>
                {text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatMessageItem;
