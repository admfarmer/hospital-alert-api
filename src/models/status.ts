import * as knex from 'knex';

export class StatusModel {

  tableName: string = 'alert_device_status';

  getInfo(db: knex) {
    return db(this.tableName)
  }

  getSelect(db: knex, hcode: any) {
    return db(this.tableName).select('hcode')
      .where('hcode', hcode)
  }

  insert(db: knex, info: any) {
    return db(this.tableName).insert(info);
  }

  update(db: knex, hcode: any, info: any) {
    return db(this.tableName)
      .where('hcode', hcode)
      .update(info);
  }

  remove(db: knex, alertDeviceId: any) {
    return db(this.tableName)
      .where('id', alertDeviceId)
      .del();
  }

}