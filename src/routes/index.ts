/// <reference path="../../typings.d.ts" />

import * as Knex from 'knex';
import * as fastify from 'fastify';
import * as http from 'http'

import { UserModel } from '../models/user';
import { Server, IncomingMessage, ServerResponse, ServerRequest } from 'http';

const userModel = new UserModel();

const router = (fastify, { }, next) => {

  var db: Knex = fastify.knex;

  fastify.get('/hello', async (req: fastify.FastifyRequest<http.IncomingMessage>, reply: fastify.FastifyReply<http.ServerResponse>) => {
    req.log.info('hello');
    reply.send({ hello: 'world' })
  })

  fastify.get('/sign-token', async (req: fastify.FastifyRequest<http.IncomingMessage>, reply: fastify.FastifyReply<http.ServerResponse>) => {
    const token = fastify.jwt.sign({ foo: 'bar' }, { expiresIn: '1d' });
    reply.send({ token: token });
  })

  fastify.get('/test-db', {
    beforeHandler: [fastify.authenticate]
  }, async (request: fastify.FastifyRequest<http.IncomingHttpHeaders>, reply) => {
    console.log(request.user);
    var rs = await userModel.getUser(db);
    reply.code(200).send({ ok: true, rows: rs })
  })

  next();

}

module.exports = router;