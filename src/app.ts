/// <reference path="../typings.d.ts" />

import path = require('path');
import * as http from 'http'
import * as HttpStatus from 'http-status-codes';
import * as fastify from 'fastify';
import * as Knex from 'knex';

require('dotenv').config({ path: path.join(__dirname, '../config') });

import { Server, IncomingMessage, ServerResponse, ServerRequest } from 'http';

import helmet = require('fastify-helmet');

const app: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({ logger: { level: 'info' }, bodyLimit: 5 * 1048576 });

app.register(require('fastify-formbody'));
app.register(require('fastify-cors'), {});
app.register(require('fastify-no-icon'));
app.register(
  helmet,
  { hidePoweredBy: { setTo: 'PHP 5.2.0' } }
);

app.register(require('fastify-rate-limit'), {
  max: +process.env.MAX_CONNECTION_PER_MINUTE || 1000,
  timeWindow: '1 minute'
});

app.register(require('fastify-static'), {
  root: path.join(__dirname, '../public'),
  prefix: '/html',
});

app.register(require('fastify-jwt'), {
  secret: process.env.SECRET_KEY
});

app.decorate("authenticate", async (request, reply) => {
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

app.register(require('fastify-knexjs'), {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: +process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  }
});

app.register(require('./routes/index'), { prefix: '/v1', logger: true });

app.get('/', async (req: fastify.FastifyRequest<http.IncomingMessage>, reply: fastify.FastifyReply<http.ServerResponse>) => {
  reply.code(200).send({ message: 'Fastify, RESTful API services!' })
});

const port = +process.env.PORT || 3000;

app.listen(port, (err) => {
  if (err) throw err;
  console.log(app.server.address());
});
