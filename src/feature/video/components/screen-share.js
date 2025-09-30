'use client';

import { Button, OverlayTrigger, Tooltip, Dropdown } from 'react-bootstrap';
import classNames from 'classnames';
import { IconFont } from '../../../component/icon-font';
import { BsLock, BsUnlock, BsChevronUp, BsCheck } from 'react-icons/bs';
import { SharePrivilege } from '@zoom/videosdk';

const ScreenShareButton = (props) => {
  const { sharePrivilege, isHostOrManager, onScreenShareClick, onSharePrivilegeClick } = props;
  
  const menuItems = [
    { 
      key: SharePrivilege.Locked, 
      label: 'Lock share',
      active: sharePrivilege === SharePrivilege.Locked
    },
    { 
      key: SharePrivilege.Unlocked, 
      label: 'One participant can share at a time',
      active: sharePrivilege === SharePrivilege.Unlocked
    },
    { 
      key: SharePrivilege.MultipleShare, 
      label: 'Multiple participants can share simultaneously',
      active: sharePrivilege === SharePrivilege.MultipleShare
    }
  ];
  
  const onMenuItemClick = (key) => {
    onSharePrivilegeClick?.(key);
  };
  
  return (
    <>
      {isHostOrManager ? (
        <Dropdown onSelect={onMenuItemClick} drop="up">
          <Dropdown.Toggle 
            as={Button} 
            variant="light"
            className="screen-share-button"
            onClick={onScreenShareClick}
          >
            <IconFont type="icon-share" />
            <BsChevronUp className="ms-1" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {menuItems.map((item) => (
              <Dropdown.Item 
                key={item.key} 
                eventKey={item.key}
                active={item.active}
              >
                {item.label} {item.active && <BsCheck className="ms-2" />}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      ) : (
        <Button
          variant="light"
          className={classNames('screen-share-button', 'vc-button')}
          onClick={onScreenShareClick}
        >
          <IconFont type="icon-share" />
        </Button>
      )}
    </>
  );
};

const ScreenShareLockButton = (props) => {
  const { isLockedScreenShare, onScreenShareLockClick } = props;
  
  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip>
          {isLockedScreenShare ? 'Unlock screen share' : 'Lock screen share'}
        </Tooltip>
      }
    >
      <Button
        variant="light"
        className="screen-share-button"
        onClick={onScreenShareLockClick}
      >
        {isLockedScreenShare ? <BsLock /> : <BsUnlock />}
      </Button>
    </OverlayTrigger>
  );
};

export { ScreenShareButton, ScreenShareLockButton };
