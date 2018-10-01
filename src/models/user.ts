import * as Knex from 'knex';

export class UserModel {
  getUser(db: Knex) {
    return db('users').select('idx', 'username', 'fullname');
  }
}