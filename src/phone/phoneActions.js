import getConfig from "next/config";

import UserAPI from '../user/services/UserAPI';
import PhoneAPI from './services/PhoneAPI';
import WebRtcClient from './services/WebRtcClient';
import WebSocketClient from './services/WebSocketClient';

export const CALLS_FETCHED = 'phone/CALLS_FETCHED';
export const INCOMING_CALL = 'phone/INCOMING_CALL';
export const RTC_CLIENT_CREATED = 'phone/RTC_CLIENT_CREATED';
export const TEXT_LISTENER_CREATED = 'phone/TEXT_LISTENER_CREATED';
export const WS_CLIENT_CREATED = 'phone/WS_CLIENT_CREATED';
export const ON_TEXT = 'phone/ON_TEXT';
export const HANGUP = 'phone/HANGUP';

const { publicRuntimeConfig: { excludedWords } } = getConfig();

export const fetchAllCalls = () => async (dispatch, getState) => {
  const { user: { apiSession: { token } } } = getState();
  const calls = await PhoneAPI.fetchActiveCalls(token);

  dispatch({ type: CALLS_FETCHED, calls: calls.items });
};

const clearCurrentSession = (rtcClient, number) => {
  const { currentSession } = rtcClient;
  const currentSessionNumber = currentSession && rtcClient.getNumber(currentSession);

  if (currentSession && number === currentSessionNumber) {
    rtcClient.currentSession = null;
  }
};

export const cancelCall = call => async (dispatch, getState) => {
  if (!call) {
    return;
  }
  const { phone: { rtcClient }, user: { apiSession }} = getState();
  await PhoneAPI.hangupCall(apiSession.token, call.id);

  clearCurrentSession(rtcClient, call.caller_id_number);

  dispatch(fetchAllCalls());
};

export const pick = call => async (dispatch, getState) => {
  const state = getState();
  const { session, apiSession } = state.user;

  await PhoneAPI.answerCall(
    apiSession.token,
    call.id,
    session.primaryContext(),
    session.primaryNumber(),
    call.caller_id_number
  );

  dispatch(fetchAllCalls());
};

export const bindPhoneActions = () => async (dispatch, getState) => {
  const { user: { session, apiSession }} = getState();
  const configuration = await UserAPI.fetchSIP(session);
  const client = new WebRtcClient(configuration.username, configuration.secret);
  const wsClient = new WebSocketClient(apiSession.token);

  client.bindActions({
    onInvite: session => {
      dispatch({ type: INCOMING_CALL, session });
    },
    onCallTerminated: (session, number) => {
      const { phone: { rtcClient }} = getState();
      clearCurrentSession(rtcClient, number);

      dispatch({ type: INCOMING_CALL, session: null });
      dispatch(fetchAllCalls());
    },
    callAccepted: () => {
      dispatch({ type: INCOMING_CALL, session: null });
    },
    onCallAccepted: () => {
      dispatch({ type: INCOMING_CALL, session: null });
    }
  });

  wsClient.bindActions({
    onCallEntered: response => {
      const { user: { apiSession: { token } } } = getState();
      PhoneAPI.playback(token, response.data.call.id);

      dispatch(fetchAllCalls());
    },
    onCallDeleted: () => {
      dispatch(fetchAllCalls());
    },
    onStt: stt => {
      const { result_stt: result, call_id: callId } = stt.data;
      const isWordExcluded = !!excludedWords.filter(word => result.indexOf(word) !== -1).length;

      if (isWordExcluded) {
        const state = getState();
        const call = state.phone.calls.find(call => call.id === callId);

        return dispatch(cancelCall(call));
      }

      return dispatch({ type: ON_TEXT, callId, result });
    }
  });

  dispatch({ type: RTC_CLIENT_CREATED, client });
  dispatch({ type: WS_CLIENT_CREATED, wsClient });
  dispatch(fetchAllCalls());
};
