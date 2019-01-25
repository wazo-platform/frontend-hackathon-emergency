import Router from 'next/router';
import getConfig from 'next/config';

import UserAPI from './services/UserAPI';

export const LOGIN_REQUEST = 'authentication/LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'authentication/LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'authentication/LOGIN_FAILURE';
export const ON_API_SESSION = 'authentication/ON_API_SESSION';
export const LOGOUT = 'authentication/LOGOUT';

import { bindPhoneActions } from '../phone/phoneActions';

const { publicRuntimeConfig } = getConfig();

const onLoginSuccess = () => async dispatch => {
  // create api user
  const apiSession = await UserAPI.login(
    publicRuntimeConfig.apiUser.username,
    publicRuntimeConfig.apiUser.password,
    false
  );

  dispatch({ type: ON_API_SESSION, apiSession });

  dispatch(bindPhoneActions());
};

export const login = (identifier, password) => async dispatch => {
  try {
    dispatch({ type: LOGIN_REQUEST });

    const session = await UserAPI.login(identifier, password);

    dispatch({ type: LOGIN_SUCCESS, session });

    dispatch(onLoginSuccess(session));

    Router.push('/home');
  } catch (e) {
    dispatch({ type: LOGIN_FAILURE });

    throw e;
  }
};

export const authenticate = token => async dispatch => {
  try {
    dispatch({ type: LOGIN_REQUEST });

    const session = await UserAPI.authenticate(token);

    dispatch({ type: LOGIN_SUCCESS, session });

    dispatch(onLoginSuccess(session));
  } catch (e) {
    dispatch({ type: LOGIN_FAILURE });
  }
};

export const logout = () => async (dispatch, getState) => {
  const state = getState();
  await UserAPI.logout(state.user.session.token);

  dispatch({ type: LOGOUT });

  Router.push('/');
};
