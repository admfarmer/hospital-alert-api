import * as fastify from 'fastify';

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Server, IncomingMessage, ServerResponse, ServerRequest } from 'http';
import * as Knex from 'knex'

declare module 'fastify' {
  interface FastifyRequest<HttpRequest> {
    user: any
  }

  interface FastifyInstance {
    Knex: Knex;
  }
}

