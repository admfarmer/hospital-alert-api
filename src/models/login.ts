import * as knex from 'knex';

export class LogisModel {

  tableName: string = 'alert_users';

  login(db: knex, username: string, password: string) {
    return db(this.tableName)
      .where({
        "username": username,
        "password": password,
        "is_active": 'Y'
      });
  }
}