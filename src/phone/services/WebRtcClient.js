import { WazoWebRTCClient } from '@wazo/sdk';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

class WebRtcClient {
  constructor(username, password) {
    this.client = new WazoWebRTCClient({
      host: publicRuntimeConfig.server,
      displayName: 'Hackathon',
      authorizationUser: username,
      password,
      media: { audio: true, video: false }
    });

    this.client.on('invite', session => {
      this._bindSessionCallbacks(session);

      this.actions.onInvite(session);
    });
    this.client.on('accepted', this._onCallAccepted);
    this.client.on('ended', session => this._onCallTerminated(session));

    this.sessions = {};
    this.currentSession = null;
  }

  bindActions = actions => {
    this.actions = actions;
  };

  accept = session => {
    // Hold current session if exists
    if (this.currentSession) {
      this.hold(this.currentSession);
    }

    this.client.answer(session);

    this._onCallAccepted(session);
  };

  hangup = call => {
    this.client.hangup(this.getSession(call));
    this.currentSession = null;
  };

  hold = call => this.client.hold(this.getSession(call.caller_id_number));

  unhold = call => this.client.unhold(this.getSession(call.caller_id_number));

  mute = session => this.client.mute(session);

  unmute = session => this.client.unmute(session);

  getNumber = session => session.remoteIdentity.uri._normal.user;

  getSession = number => Object.values(this.sessions).find(session => this.getNumber(session) === number);

  switchToNumber = number => {
    if (this.currentSession) {
      this.hold(this.currentSession);
    }

    const session = this.getSession(number);
    this.currentSession = session;
    this.unhold(session);
  };

  _bindSessionCallbacks = session => {
    const number = this.getNumber(session);

    session.on('accepted', () => this.actions.callAccepted(session, number));
    session.on('failed', () => this._onCallTerminated(session));
    session.on('rejected', () => this._onCallTerminated(session));
    session.on('terminated', () => this._onCallTerminated(session));
    session.on('cancel', () => this._onCallTerminated(session));
  };

  _onCallAccepted = session => {
    this.sessions[session.id] = session;
    this.currentSession = session;

    this.actions.onCallAccepted(session);
  };

  _onCallTerminated = session => {
    delete this.sessions[session.id];

    this.actions.onCallTerminated(session, this.getNumber(session));

    // Current session terminated ?
    if (this.currentSession && this.currentSession.id === session.id) {
      // Remaining session ? take first
      this.currentSession = Object.keys(this.sessions).length ? this.sessions[Object.keys(this.sessions)[0]] : null;
      if (this.currentSession) {
        this.unhold(this.currentSession);
      }
    }
  };
}

export default WebRtcClient;
