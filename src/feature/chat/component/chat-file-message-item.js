'use client';

import { useCallback } from 'react';
import {
  BsFileImage,
  BsFileEarmarkExcel,
  BsFileEarmark,
  BsFileEarmarkPdf,
  BsFileEarmarkWord,
  BsFileEarmarkZip,
  BsFileEarmarkPpt,
  BsX
} from 'react-icons/bs';
import { ProgressBar, Button } from 'react-bootstrap';
import { IconFont } from '../../../component/icon-font';
import { ChatFileDownloadStatus, ChatFileUploadStatus } from '@zoom/videosdk';
import classNames from 'classnames';
import ChatImageMessageItem from './chat-image-message-item';
import { isExcelFile, isImageFile, isPPTFile, isPdfFile, isWordFile, isZipFile } from '../chat-utils';

const getFileIcon = (name) => {
  if (isImageFile(name)) {
    return <BsFileImage />;
  }
  if (isPdfFile(name)) {
    return <BsFileEarmarkPdf />;
  }
  if (isWordFile(name)) {
    return <BsFileEarmarkWord />;
  }
  if (isExcelFile(name)) {
    return <BsFileEarmarkExcel />;
  }
  if (isPPTFile(name)) {
    return <BsFileEarmarkPpt />;
  }
  if (isZipFile(name)) {
    return <BsFileEarmarkZip />;
  }
  return <BsFileEarmark />;
};

const getFileStatus = (file, id) => {
  if (!id && file.upload) {
    const { upload: { status } } = file;
    if ([ChatFileUploadStatus.InProgress, ChatFileUploadStatus.Init].includes(status)) {
      return <IconFont type="icon-pendding-circle" style={{ animation: 'loading 1s linear infinite' }} />;
    } else if (status === ChatFileUploadStatus.Complete || status === ChatFileUploadStatus.Success) {
      return <IconFont type="icon-correct" />;
    } else if (status === ChatFileUploadStatus.Fail || status === ChatFileUploadStatus.Cancel) {
      return <IconFont type="icon-warning-circle" />;
    }
  }
  if (id && file.upload?.status === ChatFileUploadStatus.Complete) {
    return <IconFont type="icon-correct" />;
  }
  if (file.download) {
    const { download: { status } } = file;
    if (status === ChatFileDownloadStatus.InProgress) {
      return <IconFont type="icon-pendding-circle" style={{ animation: 'loading 1s linear infinite' }} />;
    } else if (status === ChatFileDownloadStatus.Success) {
      return <IconFont type="icon-correct" />;
    } else if (status === ChatFileDownloadStatus.Cancel || status === ChatFileDownloadStatus.Fail) {
      return <IconFont type="icon-warning-circle" />;
    }
  }
  return <IconFont type="icon-download" />;
};

const getFileSize = (size) => {
  if (size < 1024) {
    return `${size} bytes`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

const getFileTip = (file, id) => {
  if (file.upload) {
    const { upload: { status } } = file;
    if (!id) {
      if (status === ChatFileUploadStatus.Fail) {
        return '- Click to resend';
      } else if (status === ChatFileUploadStatus.Cancel) {
        return '- Canceled, click to resend';
      }
    } else if (id && status === ChatFileUploadStatus.Complete) {
      return '- Click to download';
    }
  } else if (file.download) {
    const { download: { status } } = file;
    if (status !== ChatFileDownloadStatus.InProgress) {
      return '- Click to download';
    }
  }
};

const getFileInProgress = (file, id) => {
  let isInProgress = false;
  let progress = 0;
  if (
    !id &&
    file.upload &&
    [ChatFileUploadStatus.InProgress, ChatFileUploadStatus.Init].includes(file.upload?.status)
  ) {
    isInProgress = true;
    progress = file.upload.progress;
  } else if (file.download?.status === ChatFileDownloadStatus.InProgress) {
    isInProgress = true;
    progress = file.download.progress;
  }
  return [isInProgress, progress];
};

const ChatFileMessageItem = (props) => {
  const { file, id, className, resendFile, downloadFile } = props;
  const { name, size } = file;
  const [isInProgress, progress] = getFileInProgress(file, id);
  
  const onCancelButtonClick = useCallback(
    (event) => {
      event.stopPropagation();
      if (!id && file.upload?.status === ChatFileUploadStatus.InProgress) {
        const { upload: { cancelFunc } } = file;
        cancelFunc();
      } else if (file.download?.status === ChatFileDownloadStatus.InProgress) {
        const { download: { cancelFunc } } = file;
        cancelFunc();
      }
    },
    [file, id]
  );
  
  const onFileItemClick = useCallback(() => {
    if (!isInProgress) {
      if (
        !id &&
        (file.upload?.status === ChatFileUploadStatus.Fail || file.upload?.status === ChatFileUploadStatus.Cancel)
      ) {
        const { uuid, upload: { retryToken } } = file;
        if (retryToken && uuid) {
          resendFile(retryToken, uuid);
        }
      } else if (id) {
        downloadFile(id);
      }
    }
  }, [isInProgress, id, file, resendFile, downloadFile]);
  
  return (
    <div className={classNames('chat-file-message-wrap', className)}>
      {isImageFile(name) ? (
        <ChatImageMessageItem file={file} id={id} resendFile={resendFile} downloadFile={downloadFile} />
      ) : (
        <div className="chat-file-message-item" onClick={onFileItemClick}>
          <div className="chat-file-preview">
            <div className="chat-file-icon">{getFileIcon(name)}</div>
            <div className="chat-file-status">{getFileStatus(file, id)}</div>
          </div>
          <div className="chat-file-desc">
            <h4 className="chat-file-name">{name}</h4>
            <div className="chat-file-subline">
              <span className="chat-file-size">{getFileSize(size)}</span>
              {isInProgress ? (
                <>
                  <ProgressBar now={progress} />
                  <Button size="sm" onClick={onCancelButtonClick}><BsX /></Button>
                </>
              ) : (
                <div className="chat-file-action-tip">{getFileTip(file, id)}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatFileMessageItem;
