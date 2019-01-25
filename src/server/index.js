const express = require('express');
const next = require('next');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const http = require('http');
const WebSocketServer = require('websocket').server;

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = 3000;

const startMockWsServer = () => {
  const httpServer = http.createServer();
  httpServer.listen(8000);
  const wsServer = new WebSocketServer({ httpServer });

  wsServer.on('request', request => {
    const connection = request.accept(null, request.origin);

    setTimeout(() => {
      connection.sendUTF(JSON.stringify({ callId: 123, text: 'ketchup' }));
    }, 3000);
  });
};

app
  .prepare()
  .then(() => {
    const server = express();

    server.use(cookieParser());
    server.use(morgan('dev'));
    server.get('*', (req, res) => handle(req, res));

    server.listen(port, err => {
      if (err) throw err;
      console.info(`> Ready on http://localhost:${port}`); // eslint-disable-line
    });

    startMockWsServer();
  })
  .catch(ex => {
    console.error(ex.stack); // eslint-disable-line
    if (!dev) {
      console.error(`${ex.message}: ${ex.stack}`); // eslint-disable-line
    }
    process.exit(1);
  });
