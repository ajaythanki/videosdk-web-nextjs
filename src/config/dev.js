import { getExploreName } from '../utils/platform';

export const devConfig = {
  sdkKey: 'TVNCbZfOSvWUuzd5jEungQ',
  sdkSecret: 'xynBqtpsdMVKogO8iJbU0QCoP1g4J8nwMvQ1',
  webEndpoint: 'zoom.us',
  topic: 'testing',
  name: `${getExploreName()}-${Math.floor(Math.random() * 1000)}`,
  password: 'testing',
  signature: '',
  sessionKey: 'testing',
  userIdentity: 'testing',
  role: 1
};
