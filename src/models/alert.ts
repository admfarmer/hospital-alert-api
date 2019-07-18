import * as knex from 'knex';

export class AlertModel {

  tableName: string = 'alert_log';

  getInfo(db: knex) {
    return db(this.tableName)
  }

  getAlertStart(db: knex, province: any) {
    return db('alert_log as l')
      .select('l.*')
      .select(db.raw(`a.AMPHUR_NAME as amp_name`))
      .select(db.raw(`p.PROVINCE_NAME as prov_name`))
      .innerJoin('alert_amphur as a', { 'a.AMPHUR_CODE': 'l.amphur' })
      .innerJoin('alert_province as p', { 'p.PROVINCE_CODE': 'l.province' })
      .where('l.status_flg', 'Y')
      .where('l.province', province)
      .orderBy('l.id', 'DESC');
  }

  getAlertStop(db: knex, province: any) {
    return db('alert_log as l')
      .select('l.*')
      .select(db.raw(`a.AMPHUR_NAME as amp_name`))
      .select(db.raw(`p.PROVINCE_NAME as prov_name`))
      .innerJoin('alert_amphur as a', { 'a.AMPHUR_CODE': 'l.amphur' })
      .innerJoin('alert_province as p', { 'p.PROVINCE_CODE': 'l.province' })
      .where('l.status_flg', 'N')
      .where('l.province', province)
      .orderBy('l.id', 'DESC');
  }

  statusFlg(db: knex, alertId: any, info: any) {
    return db(this.tableName).where('id', alertId).update(info);
  }

  insert(db: knex, info: any) {
    console.log('insert :', info);

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