require('dotenv').config();
import * as HttpStatus from 'http-status-codes';
import * as fastify from 'fastify';

import { Server, IncomingMessage, ServerResponse, ServerRequest } from 'http';

const path = require('path');
const helmet = require('fastify-helmet');

const server: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({ logger: { level: 'info' }, bodyLimit: 5 * 1048576 });

server.register(require('fastify-formbody'));
server.register(require('fastify-cors'), {});
server.register(require('fastify-no-icon'));
server.register(
  helmet,
  { hidePoweredBy: { setTo: 'PHP 5.2.0' } }
);

server.register(require('fastify-rate-limit'), {
  max: 100,
  timeWindow: '1 minute'
});

server.register(require('fastify-static'), {
  root: path.join(__dirname, '../public'),
  prefix: '/html',
});

server.register(require('fastify-jwt'), {
  secret: process.env.SECRET_KEY
});

server.decorate("authenticate", async (request, reply) => {
  let token: string = null;

  if (request.headers.authorization && request.headers.authorization.split(' ')[0] === 'Bearer') {
    token = request.headers.authorization.split(' ')[1];
  } else if (request.query && request.query.token) {
    token = request.query.token;
  } else {
    token = request.body.token;
  }

  try {
    const decoded = await request.jwtVerify(token);
  } catch (err) {
    reply.status(HttpStatus.UNAUTHORIZED).send({
      statusCode: HttpStatus.UNAUTHORIZED,
      error: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED),
      message: 'Access denied!'
    })
  }
});

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

server.get('/', async (req: fastify.FastifyRequest<ServerRequest>, reply: fastify.FastifyReply<ServerResponse>) => {
  reply.code(200).send({ message: 'Fastify, RESTful API services!' })
});

const port = +process.env.PORT || 3000;

server.listen(port, (err) => {
  if (err) throw err;
  console.log(server.server.address());
});
