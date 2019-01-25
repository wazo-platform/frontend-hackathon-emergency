import { combineReducers } from 'redux';

import { LOGOUT } from '../../user/userActions';
import user from '../../user/userReducer';
import phone from '../../phone/phoneReducer';

const appReducer = combineReducers({
  user,
  phone
});

const rootReducer = (state, action) => {
  let newState = state;
  if (action.type === LOGOUT) {
    newState = undefined;
  }

  return appReducer(newState, action);
};

export default rootReducer;
