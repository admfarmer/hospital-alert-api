require('dotenv').config();

import * as fastify from 'fastify';
import { Server, IncomingMessage, ServerResponse, ServerRequest } from 'http';

const serveStatic = require('serve-static');
const server: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({});

server.register(require('fastify-knexjs'), {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: +process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  }
});

server.register(require('./routes/index'), { prefix: '/v1', logger: true });

server.use(require('cors')());
// public assets
server.use('/html', serveStatic('./public'));
server.use('/assets', serveStatic('./assets'));

server.get('/', async (req: fastify.FastifyRequest<ServerRequest>, reply: fastify.FastifyReply<ServerResponse>) => {
  reply.code(200).send({ message: 'Fastify, RESTful API services!' })
});

const port = +process.env.PORT || 3000;

server.listen(port, (err) => {
  if (err) throw err;
  console.log(server.server.address());
});
