import { WazoWebSocketClient } from '@wazo/sdk';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

class WebSocketClient {
  constructor(token) {
    this.client = new WazoWebSocketClient({ host: publicRuntimeConfig.server, token, events: ['*'] });
  }

  bindActions = actions => {
    this.actions = actions;

    this.client.connect();

    this.client.on('application_call_entered', this.actions.onCallEntered);
    this.client.on('application_call_deleted', this.actions.onCallDeleted);
    this.client.on('stt', this.actions.onStt);
  };
}

export default WebSocketClient;
