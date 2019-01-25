import React from 'react';
import 'node-fetch';
import Document, { Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import JssProvider from 'react-jss/lib/JssProvider';

import getPageContext from '../src/main/getPageContext';

/* eslint-disable max-len */
/* eslint-disable react/no-danger */
class CustomDocument extends Document {
  static getInitialProps(ctx) {
    const pageContext = getPageContext(ctx);
    const sheet = new ServerStyleSheet();
    const page = ctx.renderPage(App => props =>
      sheet.collectStyles(
        <JssProvider registry={pageContext.sheetsRegistry} generateClassName={pageContext.generateClassName}>
          <App pageContext={pageContext} pathname={ctx.pathname} asPath={ctx.asPath} {...props} />
        </JssProvider>
      )
    );

    const styleTags = sheet.getStyleElement();
    const muiStyleTags = (
      <style
        id="jss-server-side"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: pageContext.sheetsRegistry.toString() }}
      />
    );

    return { ...page, styleTags, muiStyleTags };
  }

  render() {
    return (
      <html lang="en" dir="ltr">
        <Head>
          {this.props.muiStyleTags}
          {this.props.styleTags}
          <style
            dangerouslySetInnerHTML={{
              __html: `
            html, body {
              margin: 0;
              padding: 0;
              color: rgba(0, 0, 0, 0.87);
            }
            input:-webkit-autofill {
              -webkit-box-shadow: 0 0 0 30px #fafafa inset;
            }
            input:-webkit-autofill {
              background-color: transparent !important;
            }
            `
            }}
          />
          <meta charSet="utf-8" />
          <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}

export default CustomDocument;
