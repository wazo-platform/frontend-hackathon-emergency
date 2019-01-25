import { createStore, applyMiddleware, compose } from 'redux';
import persistStore from 'redux-persist/lib/persistStore';
import persistReducer from 'redux-persist/lib/persistReducer';
import thunk from 'redux-thunk';

import reducer from '.';
import configureStorage from './configureStorage';

export default function configureStore({ initialState, storageEngine }) {
  let persistedReducer;
  if (storageEngine) {
    persistedReducer = persistReducer(configureStorage('wazo', storageEngine), reducer);
  } else {
    persistedReducer = reducer;
  }

  const store = createStore(persistedReducer, initialState, compose(applyMiddleware(thunk)));

  store.__persistor = persistStore(store); // Nasty hack

  if (module.hot) {
    module.hot.accept(() => {
      const nextRootReducer = persistedReducer;
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}
