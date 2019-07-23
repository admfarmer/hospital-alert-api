import * as knex from 'knex';

export class DistModel {

  tableName: string = 'alert_amphur';

  getDistcode(db: knex, distcode: any) {
    return db(this.tableName)
      .select(`AMPHUR_CODE`, `AMPHUR_NAME`)
      .where({
        AMPHUR_CODE: distcode
      });
  }

}