import { WazoApiClient } from '@wazo/sdk';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

const TEN_HOURS = 60 * 60 * 10;

class UserAPI {
  constructor({ server }) {
    this.client = new WazoApiClient({ server });
  }

  async login(identifier, password, withProfile = true) {
    const payload = { username: identifier, password, expiration: TEN_HOURS };
    const session = await this.client.auth.logIn(payload);

    if (withProfile) {
      const profile = await this.fetchProfile(session);

      return session.using(profile);
    }

    return session;
  }

  async authenticate(token) {
    const session = await this.client.auth.authenticate(token);
    const profile = await this.fetchProfile(session);

    return session.using(profile);
  }

  async isAuthenticated(token) {
    try {
      await this.client.auth.authenticate(token);
      return true;
    } catch (e) {}

    return false;
  }

  async fetchSIP(session) {
    const line = session.primaryLine();

    return this.client.confd.getSIP(session.token, session.uuid, line.id);
  }

  async fetchProfile(session) {
    return this.client.confd.getUser(session.token, session.uuid);
  }

  async logout(token) {
    await this.client.auth.logOut(token);
  }
}

export default new UserAPI({ server: publicRuntimeConfig.server });
