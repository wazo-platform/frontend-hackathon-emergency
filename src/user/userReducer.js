import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  ON_API_SESSION,
} from './userActions';

const initialState = {
  authenticated: false,
  authenticating: false,
  token: null,
  apiSession: null,
  session: undefined
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_REQUEST: {
      return { ...state, authenticated: false, authenticating: true };
    }

    case LOGIN_SUCCESS: {
      return { ...state, authenticated: true, authenticating: false, session: action.session };
    }

    case LOGIN_FAILURE: {
      return { ...state, authenticated: false, authenticating: false };
    }

    case ON_API_SESSION: {
      return { ...state, apiSession: action.apiSession };
    }

    case LOGOUT: {
      return { ...state, authenticated: false, session: undefined };
    }

    default:
      return state;
  }
}
