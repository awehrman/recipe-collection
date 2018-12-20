require('dotenv').config({ path: '.env' });
const colors = require('colors');
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL,
    },
  },
  res => {
    console.log(`Server is now running on port http://localhost:${ res.port }`);
  }
);
