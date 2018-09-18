import { FastifyInstance, FastifyRequest } from 'fastify';
import * as Knex from 'knex'

declare module 'fastify' {
  interface FastifyRequest<HttpRequest> {

  }

  interface FastifyInstance {
    Knex: Knex
  }
}

