import React from 'react';
import { Provider } from 'react-redux';
import App, { Container } from 'next/app';
import Head from 'next/head';
import withRedux from 'next-redux-wrapper';
import CookieStorage from 'redux-persist-cookie-storage';
import Cookies from 'cookies-js';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { ThemeProvider } from 'styled-components';
import JssProvider from 'react-jss/lib/JssProvider';
import CssBaseline from '@material-ui/core/CssBaseline';

import configureStore from '../src/main/reducers/configureStore';
import getPageContext from '../src/main/getPageContext';

/**
 * @param {object} initialState
 * @param {boolean} options.isServer indicates whether it is a server side or client side
 * @param {Request} options.req NodeJS Request object (not set when client applies initialState from server)
 * @param {Request} options.res NodeJS Request object (not set when client applies initialState from server)
 * @param {boolean} options.debug User-defined debug mode param
 * @param {string} options.storeKey This key will be used to preserve store in global namespace for safe HMR
 */
const makeStore = (initialState = {}, options) => {
  const { isServer, req } = options;

  const cookiesOptions = { expiration: { default: 86400 } }; // 1 day
  let storageEngine = null;
  if (isServer && req) {
    storageEngine = new CookieStorage({ ...cookiesOptions, cookies: req.cookies });
  } else if (!isServer) {
    storageEngine = new CookieStorage({ ...cookiesOptions, cookies: Cookies });
  }

  return configureStore({ initialState, storageEngine });
};

class Wazo extends App {
  constructor(props) {
    super(props);

    this.pageContext = getPageContext();
  }

  static async getInitialProps({ Component, ctx }) {
    const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {};

    return { pageProps };
  }

  componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }

  render() {
    const { Component, pageProps, store } = this.props;
    return (
      <Container>
        <Head>
          <title>Wazo</title>
        </Head>
        <Provider store={store}>
          <JssProvider
            registry={this.pageContext.sheetsRegistry}
            generateClassName={this.pageContext.generateClassName}
          >
            <MuiThemeProvider theme={this.pageContext.theme} sheetsManager={this.pageContext.sheetsManager}>
              <CssBaseline />
              <ThemeProvider theme={this.pageContext.theme}>
                <Component pageContext={this.pageContext} {...pageProps} />
              </ThemeProvider>
            </MuiThemeProvider>
          </JssProvider>
        </Provider>
      </Container>
    );
  }
}

export default withRedux(makeStore)(Wazo);
