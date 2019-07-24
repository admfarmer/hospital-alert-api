import * as knex from 'knex';

export class StatusModel {

  tableName: string = 'alert_device_status';

  getInfo(db: knex) {
    return db(this.tableName)
  }

  getUpdate(db: knex) {
    return db(this.tableName)
      .where({
        status_flg: 'Y'
      })
      .update({
        status_flg: 'N'
      });
  }

  getSelectDown(db: knex) {
    return db(this.tableName)
      .where({
        status_flg: 'N'
      })
  }

  getSelect(db: knex, hcode: any, hosname: any) {
    return db(this.tableName).select('hcode')
      .where({
        hcode: hcode,
        hosname: hosname
      })
  }

  insert(db: knex, info: any) {
    return db(this.tableName).insert(info);
  }

  update(db: knex, hcode: any, hosname: any, info: any) {
    return db(this.tableName)
      .where({
        hcode: hcode,
        hosname: hosname
      })
      .update(info);
  }

  remove(db: knex, alertDeviceId: any) {
    return db(this.tableName)
      .where('id', alertDeviceId)
      .del();
  }

}