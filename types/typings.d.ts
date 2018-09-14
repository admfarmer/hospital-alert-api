import * as http from 'http'
import * as Knex from 'knex'

declare namespace fastify {

  // interface FastifyRequest<HttpRequest> {

  // }

  // interface FastifyReply<HttpResponse> {

  // }

  interface FastifyInstance<HttpServer = http.Server, HttpRequest = http.IncomingMessage, HttpResponse = http.ServerResponse> {
    knex: Knex
  }
}

export = fastify;
