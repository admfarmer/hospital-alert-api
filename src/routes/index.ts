/// <reference path="../../typings.d.ts" />

import * as Knex from 'knex';
import * as fastify from 'fastify';

import { AlertModel } from '../models/alert';
import { BotlineModel } from '../models/botline';
import { TokenModel } from '../models/token';
import { DistModel } from '../models/dist';

import * as HttpStatus from 'http-status-codes';
import * as moment from 'moment';

const alertModel = new AlertModel();
const botlineModel = new BotlineModel();
const tokenModel = new TokenModel();
const distModel = new DistModel();

const router = (fastify, { }, next) => {

  var db: Knex = fastify.db;
  var info: any;
  fastify.get('/', async (req: fastify.Request, reply: fastify.Reply) => {
    reply.code(200).send({ message: 'Welcome to SMART HIS API services!', version: '1.0 build 20190522-1' })
  });

  fastify.get('/info', async (req: fastify.Request, reply: fastify.Reply) => {
    try {
      const rs: any = await alertModel.getInfo(db);
      reply.code(HttpStatus.OK).send({ info: rs })
    } catch (error) {
      // console.log(error);
      reply.code(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }
  });

  fastify.get('/alertStart/:province', async (req: fastify.Request, reply: fastify.Reply) => {
    const province: any = req.params.province;
    try {
      const rs: any = await alertModel.getAlertStart(db, province);
      reply.code(HttpStatus.OK).send({ info: rs })
    } catch (error) {
      reply.code(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }
  });

  fastify.get('/alertStop/:province', async (req: fastify.Request, reply: fastify.Reply) => {
    const province: any = req.params.province;

    try {
      const rs: any = await alertModel.getAlertStop(db, province);
      reply.code(HttpStatus.OK).send({ info: rs })
    } catch (error) {
      reply.code(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }
  });

  fastify.put('/statusFlg/:alertId', async (req: fastify.Request, reply: fastify.Reply) => {
    const info: any = req.body.datas;
    const alertId: any = req.params.alertId;

    try {
      const rs: any = await alertModel.statusFlg(db, alertId, info);
      reply.code(HttpStatus.OK).send({ info: rs })
    } catch (error) {
      reply.code(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }
  });

  fastify.post('/insert', async (req: fastify.Request, reply: fastify.Reply) => {
    // console.log(req);
    const _info: any = req.body;
    let hos_name: any = _info.hos_name;
    let amphur: any = _info.amphur;
    let province: any = _info.province;
    let type: any = _info.type;
    let hcode: any = _info.hcode;
    let remark: any = _info.remark;
    let create_date: any = _info.create_date || moment(Date()).format('YYYY-MM-DD');
    let create_time: any = _info.create_time || moment(Date()).format('HH:mm:ss');
    let status_flg: any = _info.status_flg || 'Y';

    if (type == 'iot') {
      this.info = {
        hos_name: hos_name,
        amphur: amphur,
        province: province,
        hcode: hcode,
        remark: 'แจ้งเหตุห้องอุบัติฉุกเฉินโรงพยาบาล',
        create_date: moment(create_date).format('YYYY-MM-DD'),
        create_time: create_time,
        status_flg: status_flg
      }
    } else {
      this.info = {
        hos_name: hos_name,
        amphur: amphur,
        province: province,
        hcode: hcode,
        remark: remark,
        create_date: moment(create_date).format('YYYY-MM-DD'),
        create_time: create_time,
        status_flg: status_flg
      }
    }
    // console.log(info);
    if (hos_name && amphur && province && this.info.remark && this.info.hcode) {
      try {

        const rs: any = await alertModel.insert(db, this.info);
        // console.log(rs);
        if (rs[0]) {
          reply.code(HttpStatus.OK).send({ info: rs })
          const topic = `${process.env.ALERT_CENTER_TOPIC}/${province}`;
          let message = JSON.stringify(`alert`);

          fastify.mqttClient.publish(topic, message, { qos: 0, retain: false });

          const _dist = await distModel.getDistcode(db, this.info.amphur);
          let distName = _dist[0].AMPHUR_NAME;
          const _token = await tokenModel.info(db, this.info.amphur, this.info.province, this.info.hcode);
          // console.log(_token[0].line_token);
          let token = _token[0].line_token;
          let token191ubon = `nI6C9J7q7HDl3P3ZiItY5PzzY4dbttbu0cfAD6dSJHo`

          let messages = `เลขที่แจ้งเหตุ : ${rs[0]} สถานบริการ : ${this.info.hos_name} อำเภอ : ${distName} วันที่แจ้งเหตุ :${this.info.create_date} เวลา :${this.info.create_time} ข้อความ : ${this.info.remark}`;
          const rs_bot: any = await botlineModel.botLine(messages, token);
          const rs_191ubon: any = await botlineModel.botLineToken(messages, token191ubon);
        }
      } catch (error) {
        reply.code(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
      }
    } else {
      reply.code(HttpStatus.FAILED_DEPENDENCY).send({ info: false });
    }
  });

  fastify.put('/update/:alertId', async (req: fastify.Request, reply: fastify.Reply) => {
    // console.log('xxx', req.body);
    this.info = req.body;
    const alertId: any = req.params.alertId;
    // console.log('amphur', this.info.amphur);
    // console.log('province', this.info.province);
    // console.log('hcode', this.info.hcode);

    try {

      const rs: any = await alertModel.update(db, alertId, this.info);
      // console.log(rs);
      if (rs) {
        reply.code(HttpStatus.OK).send({ info: rs })
        const topic = `${process.env.ALERT_CENTER_TOPIC}/${info.province}`;
        let message = JSON.stringify(`update`);
        fastify.mqttClient.publish(topic, message, { qos: 0, retain: false });

        const _dist = await distModel.getDistcode(db, this.info.amphur);
        let distName = _dist[0].AMPHUR_NAME;

        const _token = await tokenModel.info(db, this.info.amphur, this.info.province, this.info.hcode);
        // console.log(_token);
        let token = _token[0].line_token;
        let token191ubon = `nI6C9J7q7HDl3P3ZiItY5PzzY4dbttbu0cfAD6dSJHo`

        let messages = `เลขที่แจ้งเหตุ : ${alertId} สถานบริการ : ${this.info.hos_name} อำเภอ : ${distName} วันที่แจ้งเหตุ :${this.info.create_date} วันที่ตอบรับ :${this.info.ans_date} เวลา :${this.info.ans_time} หมายเหตุ :${this.info.message}`;
        const rs_bot: any = await botlineModel.botLine(messages, token);
        const rs_191ubon: any = await botlineModel.botLineToken(messages, token191ubon);
      }

    } catch (error) {
      reply.code(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }
  });

  fastify.delete('/remove/:userId', async (req: fastify.Request, reply: fastify.Reply) => {
    const alertId: any = req.params.alertId;
    try {
      await alertModel.remove(db, alertId);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK })
    } catch (error) {
      fastify.log.error(error);
      reply.code(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }
  })
  next();
}

module.exports = router;