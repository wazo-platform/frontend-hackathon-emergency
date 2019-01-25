import getConfig from 'next/config';

import {
  CALLS_FETCHED,
  RTC_CLIENT_CREATED,
  INCOMING_CALL,
  TEXT_LISTENER_CREATED,
  ON_TEXT,
  WS_CLIENT_CREATED
} from './phoneActions';

const initialState = {
  incoming: null,
  rtcClient: null,
  wsClient: null,
  textListener: null,
  calls: []
};

const { publicRuntimeConfig } = getConfig();

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CALLS_FETCHED: {
      return {
        ...state,
        calls: action.calls
          .filter(call => call.is_caller)
          .map(call => {
            call.isPicked = call.node_uuid !== publicRuntimeConfig.appId;

            return call;
          })
      };
    }

    case RTC_CLIENT_CREATED: {
      return { ...state, rtcClient: action.client };
    }

    case WS_CLIENT_CREATED: {
      return { ...state, wsClient: action.wsClient };
    }

    case TEXT_LISTENER_CREATED: {
      return { ...state, textListener: action.textListener };
    }

    case INCOMING_CALL: {
      return { ...state, incoming: action.session };
    }

    case ON_TEXT: {
      const calls = state.calls ? [...state.calls] : [];
      const callIdx = calls.findIndex(call => call.id === action.callId);

      if (callIdx > -1) {
        calls[callIdx].variables.STT = `${calls[callIdx].variables.STT || ''} ${action.result}`;
      }

      return { ...state, calls };
    }

    default:
      return state;
  }
}
