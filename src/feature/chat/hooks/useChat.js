import { useState, useCallback, useEffect } from 'react';
import { ChatFileDownloadStatus } from '@zoom/videosdk';
import produce from 'immer';
import { v4 as uuidv4 } from 'uuid';
import { useParticipantsChange } from './useParticipantsChange';
import { isImageFile } from '../chat-utils';

export function useChat(zmClient, chatClient) {
  const [records, setRecords] = useState([]);
  const [receivers, setReceivers] = useState([]);
  const [privilege, setPrivilege] = useState(chatClient.getPrivilege());
  const [chatUser, setChatUser] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [isManager, setIsManager] = useState(false);
  
  const onChatMessage = useCallback(
    (payload) => {
      setRecords(
        produce((records) => {
          const { length } = records;
          if (length > 0) {
            const lastRecord = records[length - 1];
            if (
              payload.sender.userId === lastRecord.sender.userId &&
              payload.receiver.userId === lastRecord.receiver.userId &&
              !payload.file &&
              !!lastRecord.message &&
              payload.timestamp - lastRecord.timestamp < 1000 * 60 * 5
            ) {
              if (Array.isArray(lastRecord.message)) {
                lastRecord.message.push(payload.message);
              } else {
                lastRecord.message = [lastRecord.message, payload.message];
              }
            } else {
              const currentUserId = zmClient.getSessionInfo().userId;
              if (payload.file && payload.sender.userId === currentUserId) {
                const record = records.find(
                  (item) =>
                    item.sender.userId === currentUserId &&
                    item.file?.name === payload.file?.name &&
                    item.file?.size === payload.file?.size &&
                    item.file?.type === payload.file?.type &&
                    item.receiver.userId === payload.receiver.userId &&
                    !item.id
                );
                if (record) {
                  const objectUrl = record.file?.originalFileObjectUrl;
                  let nPayload = payload;
                  if (objectUrl && payload.file) {
                    const { file, ...restProps } = payload;
                    nPayload = {
                      ...restProps,
                      file: {
                        ...file,
                        originalFileObjectUrl: objectUrl
                      }
                    };
                  }
                  Object.assign(record, { ...nPayload });
                }
              } else {
                records.push(payload);
              }
            }
          } else {
            records.push(payload);
          }
        })
      );
    },
    [zmClient]
  );
  
  const onPrivilegeChange = useCallback(
    (payload) => {
      setPrivilege(payload.chatPrivilege);
      if (chatClient) {
        setReceivers(chatClient.getReceivers());
      }
    },
    [chatClient]
  );
  
  const onFileUploadProgressChange = useCallback(
    (payload) => {
      const { fileName, fileSize, receiverId, progress, status, retryToken } = payload;
      const currentUserId = zmClient.getSessionInfo().userId;
      setRecords(
        produce((records) => {
          const record = records
            .slice(0)
            .reverse()
            .find(
              (item) =>
                !item.id &&
                item.file?.name === fileName &&
                item.file?.size === fileSize &&
                item.sender.userId === currentUserId &&
                item.receiver.userId === receiverId
            );
          if (record?.file?.upload) {
            Object.assign(record.file.upload, { progress, status, retryToken });
          }
        })
      );
    },
    [zmClient]
  );
  
  const onFileDownloadProgressChange = useCallback((payload) => {
    const { id, fileName, fileSize, fileUrl, fileBlob, senderId, progress, status } = payload;
    setRecords(
      produce((records) => {
        const record = records.find(
          (item) =>
            item.id === id &&
            item.file?.name === fileName &&
            item.file?.size === fileSize &&
            item.file?.fileUrl === fileUrl &&
            item.sender.userId === senderId
        );
        if (record?.file?.download) {
          Object.assign(record.file.download, { progress, status });
        }
        if (record?.file && fileBlob) {
          Object.assign(record?.file, { originalFileObjectUrl: window.URL.createObjectURL(fileBlob) });
        }
      })
    );
  }, []);

  const sendMessage = useCallback(
    (text) => {
      if (chatUser) {
        chatClient.send(text, chatUser.userId);
      }
    },
    [chatUser, chatClient]
  );
  
  const sendFile = useCallback(
    async (file) => {
      if (chatUser) {
        const cancelFunc = await chatClient.sendFile(file, chatUser.userId);
        setRecords(
          produce((records) => {
            records.push({
              file: {
                name: file.name,
                size: file.size,
                type: file.type,
                uuid: uuidv4(),
                originalFileObjectUrl: file && isImageFile(file.name) ? window.URL.createObjectURL(file) : undefined,
                upload: {
                  cancelFunc: cancelFunc,
                  status: 0,
                  progress: 0
                }
              },
              sender: {
                name: '',
                userId: zmClient.getSessionInfo().userId
              },
              receiver: {
                name: chatUser.displayName,
                userId: chatUser.userId
              },
              timestamp: new Date().getTime()
            });
          })
        );
      }
    },
    [chatUser, chatClient, zmClient]
  );
  
  const resendFile = useCallback(
    async (retryToken, fileUuid) => {
      if (chatUser) {
        const cancelFunc = await chatClient.sendFile(retryToken, chatUser.userId);
        setRecords(
          produce((records) => {
            const record = records.find((item) => item.file?.uuid === fileUuid);
            if (record?.file?.upload) {
              Object.assign(record.file?.upload, { cancelFunc });
            }
          })
        );
      }
    },
    [chatUser, chatClient]
  );
  
  const downloadFile = useCallback(
    async (id, blob) => {
      const record = records.find((item) => item.id === id);
      if (record?.file?.fileUrl) {
        const cancelFunc = await chatClient.downloadFile(id, record.file.fileUrl, blob);
        setRecords(
          produce((records) => {
            const draftRecord = records.find((item) => item.id === id);
            if (draftRecord?.file) {
              Object.assign(draftRecord.file, {
                download: { cancelFunc, status: ChatFileDownloadStatus.InProgress, progress: 0 }
              });
            }
          })
        );
      }
    },
    [chatClient, records]
  );
  
  const setChatUserId = useCallback(
    (userId) => {
      const user = receivers.find((user) => user.userId === userId);
      if (user) {
        setChatUser(user);
      }
    },
    [receivers]
  );
  
  useParticipantsChange(zmClient, () => {
    if (chatClient) {
      setReceivers(chatClient.getReceivers());
    }
    setIsHost(zmClient.isHost());
    setIsManager(zmClient.isManager());
  });

  useEffect(() => {
    zmClient.on('chat-on-message', onChatMessage);
    zmClient.on('chat-file-upload-progress', onFileUploadProgressChange);
    zmClient.on('chat-file-download-progress', onFileDownloadProgressChange);
    return () => {
      zmClient.off('chat-on-message', onChatMessage);
      zmClient.off('chat-file-upload-progress', onFileUploadProgressChange);
      zmClient.off('chat-file-download-progress', onFileDownloadProgressChange);
    };
  }, [zmClient, onChatMessage, onFileUploadProgressChange, onFileDownloadProgressChange]);
  
  useEffect(() => {
    zmClient.on('chat-privilege-change', onPrivilegeChange);
    return () => {
      zmClient.off('chat-privilege-change', onPrivilegeChange);
    };
  }, [zmClient, onPrivilegeChange]);
  
  useEffect(() => {
    if (chatUser) {
      const index = receivers.findIndex((user) => user.userId === chatUser.userId);
      if (index === -1) {
        setChatUser(receivers[0]);
      }
    } else {
      if (receivers.length > 0) {
        setChatUser(receivers[0]);
      }
    }
  }, [receivers, chatUser]);
  
  return {
    records,
    receivers,
    privilege,
    chatUser,
    isHostOrManager: isHost || isManager,
    sendMessage,
    sendFile,
    resendFile,
    downloadFile,
    setChatUserId
  };
}
