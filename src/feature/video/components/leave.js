'use client';

import { Button, Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import classNames from 'classnames';
import { BsChevronUp } from 'react-icons/bs';
import { IconFont } from '../../../component/icon-font';

const LeaveButton = (props) => {
  const { onLeaveClick, onEndClick, isHost, className } = props;

  const handleEndClick = (e) => {
    e.stopPropagation();
    onEndClick?.({ key: 'end' });
  };

  if (isHost) {
    return (
      <Dropdown onSelect={handleEndClick} drop="up">
        <Dropdown.Toggle
          as={Button}
          variant="outline-light"
          className={classNames('vc-button', 'vc-dropdown-button')}
          onClick={onLeaveClick}
          style={{ borderRadius: '50%' }}
        >
          <IconFont type="icon-leave" />
          <BsChevronUp className="ms-1" />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item eventKey="end" onClick={handleEndClick}>
            End session
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip>
          Leave meeting
        </Tooltip>
      }
    >
      <Button
        variant="outline-light"
        className={classNames('vc-button', className)}
        onClick={onLeaveClick}
        style={{ borderRadius: '50%' }}
      >
        <IconFont type="icon-leave" />
      </Button>
    </OverlayTrigger>
  );
};

export { LeaveButton };
