import * as Knex from 'knex';
import * as fastify from 'fastify';

import { Server, IncomingMessage, ServerResponse, ServerRequest } from 'http';

module.exports = (fastify, { }, next) => {
  var db: Knex = fastify.knex;

  fastify.get('/hello', async (req: fastify.FastifyRequest<ServerRequest>, reply: fastify.FastifyReply<ServerResponse>) => {
    req.log.info('hello');
    reply.send({ hello: 'world' })
  })

  fastify.get('/hi', async (req: fastify.FastifyRequest<ServerRequest>, reply: fastify.FastifyReply<ServerResponse>) => {
    reply.send({ hi: 'world' })
  })

  fastify.get('/test-db', async (req, reply) => {
    var rs = await db('users').select('id', 'username', 'fullname');
    reply.code(200).send({ ok: true, rows: rs })
  })

  next()

}