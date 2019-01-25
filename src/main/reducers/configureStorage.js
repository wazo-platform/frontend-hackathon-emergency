import createTransform from 'redux-persist/lib/createTransform';

import { pick } from '../utils';

const paths = [['user', ['session', 'apiSession']]];

const transforms = [];
const whitelist = [];

// Paths always override the initialState, because upcoming service workers.
// Paths are explicit, because upcoming migration.
paths.forEach(([feature, props]) => {
  whitelist.push(feature);

  if (!props) return;
  const inOut = state => pick(props, state);
  transforms.push(createTransform(inOut, inOut, { whitelist: [feature] }));
});

const configureStorage = (appName, storage) => ({
  key: appName,
  storage,
  transforms,
  whitelist
});

export default configureStorage;
