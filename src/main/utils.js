export const isBrowser = () => typeof document !== 'undefined';

export const pick = (keys, object) =>
  keys.reduce((obj, key) => {
    if (object[key]) {
      obj[key] = object[key];
    }
    return obj;
  }, {});

export const getUserCookies = req => {
  const cookies = req ? JSON.parse(req.cookies['persist%3Awazo'] || '{"user": "{}"}') : null;
  const isPresent = cookies && cookies.user && cookies.user !== 'null' && cookies.user !== '{}';

  return cookies ? JSON.parse(!isPresent ? '{"user": "{}"}' : cookies.user) : { user: {} };
};
