/// <reference path="../../typings.d.ts" />

import * as Knex from 'knex';
import * as fastify from 'fastify';

import { AlertModel } from '../models/alert';
import { BotlineModel } from '../models/botline';

import * as HttpStatus from 'http-status-codes';
import * as moment from 'moment';

const alertModel = new AlertModel();
const botlineModel = new BotlineModel();

const router = (fastify, { }, next) => {

  var db: Knex = fastify.db;

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
    let remark: any = _info.remark;
    let create_date: any = _info.create_date || moment(Date()).format('YYYY-MM-DD');
    let create_time: any = _info.create_time || moment(Date()).format('HH:mm:ss');
    let status_flg: any = _info.status_flg || 'Y';

    const info: any = {
      hos_name: hos_name,
      amphur: amphur,
      province: province,
      remark: remark,
      create_date: moment(create_date).format('YYYY-MM-DD'),
      create_time: create_time,
      status_flg: status_flg
    }
    // console.log(info);
    if (hos_name && amphur && province) {
      try {
        const rs: any = await alertModel.insert(db, info);
        // console.log(rs);
        if (rs[0]) {
          reply.code(HttpStatus.OK).send({ info: rs })
          const topic = `${process.env.ALERT_CENTER_TOPIC}/${province}`;
          let message = JSON.stringify(`alert`);

          fastify.mqttClient.publish(topic, message, { qos: 0, retain: false });
          let messages = `เลขที่แจ้งเหตุ : ${rs[0]} สถานบริการ : ${info.hos_name} วันที่แจ้งเหตุ :${info.create_date} เวลา :${info.create_time}`;
          const rs_bot: any = botlineModel.botLine(messages);
        }
      } catch (error) {
        reply.code(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
      }
    } else {
      reply.code(HttpStatus.FAILED_DEPENDENCY).send({ info: false });
    }
  });

  fastify.put('/update/:alertId', async (req: fastify.Request, reply: fastify.Reply) => {
    // console.log(req.body);
    const info: any = req.body;
    const alertId: any = req.params.alertId;
    // console.log(info);

    try {
      const rs: any = await alertModel.update(db, alertId, info);
      // console.log(rs);
      if (rs) {
        reply.code(HttpStatus.OK).send({ info: rs })
        const topic = `${process.env.ALERT_CENTER_TOPIC}/${info.province}`;
        let message = JSON.stringify(`update`);
        fastify.mqttClient.publish(topic, message, { qos: 0, retain: false });
        let messages = `เลขที่แจ้งเหตุ : ${alertId} สถานบริการ : ${info.hos_name} วันที่แจ้งเหตุ :${info.create_date} วันที่ตอบรับ :${info.ans_date} เวลา :${info.ans_time} หมายเหตุ :${info.message}`;
        const rs_bot: any = botlineModel.botLine(messages);
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