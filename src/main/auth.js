import React from 'react';
import Router from 'next/router';

import { getUserCookies } from './utils';
import UserAPI from '../user/services/UserAPI';

const getUserToken = ctx => {
  const state = ctx.store.getState();
  const userCookies = getUserCookies(ctx.req);

  return (state.user.session && state.user.session.token) || (userCookies.session && userCookies.session.token);
};

const isTokenValid = async token => UserAPI.isAuthenticated(token);

const redirect = (path, ctx) => {
  if (ctx.res) {
    ctx.res.writeHead(303, { Location: path });
    ctx.res.end();
  } else {
    Router.replace(path);
  }
};

const getHoc = (Component, shouldBeAuthenticated, redirectPath) =>
  class Authenticated extends React.Component {
    static async getInitialProps(ctx) {
      const props = Component.getInitialProps ? Component.getInitialProps(ctx) : {};
      const token = getUserToken(ctx);
      const isValid = await isTokenValid(token);

      if ((shouldBeAuthenticated && !isValid) || (!shouldBeAuthenticated && isValid)) {
        redirect(redirectPath, ctx);
      }

      return props;
    }

    render() {
      return <Component {...this.props} />;
    }
  };

export const withAuth = Component => getHoc(Component, true, '/');
export const withoutAuth = Component => getHoc(Component, false, '/home');
