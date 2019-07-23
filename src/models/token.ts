import * as knex from 'knex';

export class TokenModel {

  tableName: string = 'alert_tokens';

  info(db: knex, amphur: string, province: string, hcode: string) {
    return db(this.tableName)
      .where({
        "hcode": hcode,
        "amphur": amphur,
        "province": province
      });
  }
}