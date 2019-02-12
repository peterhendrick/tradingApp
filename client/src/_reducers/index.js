import { combineReducers } from 'redux';
import modal from './modal.reducer';

import { authentication } from './authentication.reducer';
import { registration } from './registration.reducer';
import { users } from './users.reducer';
import { alert } from './alert.reducer';

const rootReducer = combineReducers({
  authentication,
  registration,
  users,
  modal,
  alert
});

export default rootReducer;