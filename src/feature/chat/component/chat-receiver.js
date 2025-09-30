'use client';

import { useCallback, useContext, useRef } from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import { BsCheck, BsChevronDown, BsDash, BsFileEarmark } from 'react-icons/bs';
import { ChatPrivilege } from '@zoom/videosdk';
import './chat-receiver.scss';
import ZoomContext from '../../../context/zoom-context';
import { getAntdDropdownMenu, getAntdItem } from '../chat-utils';

const meetingChatPrivilegeList = [
  {
    name: 'No One',
    value: ChatPrivilege.NoOne
  },
  {
    name: 'Everyone Publicly',
    value: ChatPrivilege.EveryonePublicly
  },
  {
    name: 'Everyone Publicly and Directly',
    value: ChatPrivilege.All
  }
];

const ChatReceiverContainer = (props) => {
  const { chatUsers, selectedChatUser, chatPrivilege, isHostOrManager, setChatUser, sendFile } = props;
  const zmClient = useContext(ZoomContext);
  const chatClient = zmClient.getChatClient();
  const fileInputRef = useRef(null);
  
  const menuItems = chatUsers.map((item) =>
    getAntdItem(
      <>
        {item.displayName}
        {(item.isCoHost || item.isHost) && (
          <span className="chat-receiver-item-affix">({item.isHost ? 'Host' : 'Co-host'})</span>
        )}
      </>,
      item.userId,
      selectedChatUser?.userId === item.userId && <CheckOutlined />
    )
  );
  
  const privilegeMenuItems = isHostOrManager
    ? [
        getAntdItem(
          'Participant Can Chat With:',
          'privilege',
          undefined,
          meetingChatPrivilegeList.map((item) =>
            getAntdItem(item.name, item.value, item.value === chatPrivilege && <CheckOutlined />)
          ),
          'group'
        )
      ]
    : null;

  const onMenuItemClick = useCallback(
    ({ key }) => {
      const userId = Number(key);
      if (userId !== selectedChatUser?.userId) {
        setChatUser(userId);
      }
    },
    [selectedChatUser, setChatUser]
  );
  
  const onMenuItemPrivilegeClick = useCallback(
    ({ key }) => {
      const privilege = Number(key);
      if (chatPrivilege !== privilege) {
        chatClient?.setPrivilege(privilege);
      }
    },
    [chatPrivilege, chatClient]
  );
  
  const onSendFileClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  const onFileChange = useCallback(
    (event) => {
      const target = event.target;
      const { files } = target;
      if (files && files?.length > 0) {
        sendFile(files[0]);
      }
      target.value = '';
    },
    [sendFile]
  );
  
  return (
    <div className="chat-receiver">
      <div className="chat-receiver-wrap">
        <span className="chat-to">To:</span>
        <Dropdown>
          <Dropdown.Toggle variant="secondary" className="chat-receiver-button">
            {selectedChatUser?.displayName} <BsChevronDown />
          </Dropdown.Toggle>
          <Dropdown.Menu>{menuItems}</Dropdown.Menu>
        </Dropdown>
      </div>
      {chatClient.isFileTransferEnabled() && (
        <div className="chat-send-file">
          <Button type="ghost" onClick={onSendFileClick}>
            <BsFileEarmark />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="chat-send-file-input"
            onChange={onFileChange}
            accept={chatClient.getFileTransferSetting().typeLimit}
          />
        </div>
      )}
      {isHostOrManager && privilegeMenuItems && (
        <Dropdown
          menu={getAntdDropdownMenu(privilegeMenuItems, onMenuItemPrivilegeClick, 'chat-receiver-dropdown-menu')}
          placement="topRight"
          trigger={['click']}
        >
          <Button className="chat-privilege-button">
            <DashOutlined />
          </Button>
        </Dropdown>
      )}
    </div>
  );
};

export default ChatReceiverContainer;
