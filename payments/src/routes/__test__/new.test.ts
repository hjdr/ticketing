import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@hr-tickets-app/common';

it ('returns a 404 error when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      orderId: mongoose.Types.ObjectId().toHexString(),
      token: 'test-token',
    })
    .expect(404)
})

it ('returns a 401 error when purchasing an order that does not belong to user', async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 25,
    status: OrderStatus.Created,
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
  })
  await order.save();
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      orderId: order.id,
      token: 'test-token',
    })
    .expect(401)
})

it ('returns a 400 error when purchasing a cancelled order', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 25,
    status: OrderStatus.Cancelled,
    userId,
    version: 0,
  })
  await order.save();
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      orderId: order.id,
      token: 'test-token',
    })
    .expect(400)
})
