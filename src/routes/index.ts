/// <reference path="../../typings.d.ts" />

import * as Knex from 'knex';
import * as fastify from 'fastify';

import { AlertModel } from '../models/alert';
import * as HttpStatus from 'http-status-codes';
const alertModel = new AlertModel();

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
      console.log(error);
      reply.code(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }
  });

  fastify.get('/alertStart', async (req: fastify.Request, reply: fastify.Reply) => {
    try {
      const rs: any = await alertModel.getAlertStart(db);
      reply.code(HttpStatus.OK).send({ info: rs })
    } catch (error) {
      reply.code(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }
  });

  fastify.get('/alertStop', async (req: fastify.Request, reply: fastify.Reply) => {
    try {
      const rs: any = await alertModel.getAlertStop(db);
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
    console.log(req.body);

    const info: any = req.body;
    // let info = {
    //   hos_name: 'โรงพยาบาลตาลสุม',
    //   amphur: '3420',
    //   province: '34',
    //   create_date: '2019-07-01',
    //   create_time: '03:24:18',
    //   status_flg: 'Y'
    // }
    console.log(info);
    try {
      const rs: any = await alertModel.insert(db, info);
      reply.code(HttpStatus.OK).send({ info: rs })

      const topic = process.env.ALERT_CENTER_TOPIC;
      fastify.mqttClient.publish(topic, 'update alert', { qos: 0, retain: false });

    } catch (error) {
      reply.code(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }
  });

  fastify.put('/update/:alertId', async (req: fastify.Request, reply: fastify.Reply) => {
    // console.log(req.body);
    const info: any = req.body;
    const alertId: any = req.params.alertId;
    // console.log(info);

    try {
      const rs: any = await alertModel.update(db, alertId, info);
      reply.code(HttpStatus.OK).send({ info: rs })
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