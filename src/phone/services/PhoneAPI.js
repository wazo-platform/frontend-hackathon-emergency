import { WazoApiClient } from '@wazo/sdk';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

class PhoneAPI {
  constructor({ server }) {
    this.client = new WazoApiClient({ server });
  }

  async fetchActiveCalls(token) {
    return this.client.application.calls(token, publicRuntimeConfig.appId);
  }

  async answerCall(token, callId, context, exten, number) {
    return this.client.application.answerCall(token, publicRuntimeConfig.appId, callId, context, exten, true, number);
  }

  async hangupCall(token, callId) {
    return this.client.application.hangupCall(token, publicRuntimeConfig.appId, callId);
  }

  async playback(token, callId) {
    return this.client.application.playCall(token, publicRuntimeConfig.appId, callId, 'fr_FR', 'sound:urgence');
  }

  async logout(token) {
    await this.client.auth.logOut(token);
  }
}

export default new PhoneAPI({ server: publicRuntimeConfig.server });
