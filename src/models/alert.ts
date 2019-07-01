import * as knex from 'knex';

export class AlertModel {

  tableName: string = 'alert_log';

  getInfo(db: knex) {
    return db(this.tableName)
  }

  getAlertStart(db: knex) {
    return db(this.tableName).where('status_flg', 'Y')
  }

  getAlertStop(db: knex) {
    return db(this.tableName).where('status_flg', 'N')
  }

  insert(db: knex, info: any) {
    return db(this.tableName).insert(info);
  }

  update(db: knex, alertId: any, info: any) {
    return db(this.tableName)
      .where('id', alertId)
      .update(info);
  }

  remove(db: knex, alertId: any) {
    return db(this.tableName)
      .where('id', alertId)
      .del();
  }

}