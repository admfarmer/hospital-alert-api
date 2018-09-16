import * as Knex from 'knex';
import * as fastify from 'fastify';

import { UserModel } from '../models/user';
import { Server, IncomingMessage, ServerResponse, ServerRequest } from 'http';

const userModel = new UserModel();

const router = (fastify, { }, next) => {

  var db: Knex = fastify.knex;

  fastify.get('/hello', async (request: fastify.FastifyRequest<ServerRequest>, reply: fastify.FastifyReply<ServerResponse>) => {
    request.log.info('hello');
    reply.send({ hello: 'world' })
  })

  fastify.get('/sign-token', async (request: fastify.FastifyRequest<ServerRequest>, reply: fastify.FastifyReply<ServerResponse>) => {
    const token = fastify.jwt.sign({ foo: 'bar' }, { expiresIn: '1d' });
    reply.send({ token: token });
  })

  fastify.get('/test-db', {
    beforeHandler: [fastify.authenticate]
  }, async (request, reply) => {
    console.log(request.user);
    var rs = await userModel.getUser(db);
    reply.code(200).send({ ok: true, rows: rs })
  })

  next();

}

module.exports = router;