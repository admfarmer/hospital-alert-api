import * as knex from 'knex';

export class TokenModel {

  tableName: string = 'alert_tokens';

  info(db: knex, amphur: string, province: string) {
    return db(this.tableName)
      .where({
        "amphur": amphur,
        "province": province
      });
  }
}