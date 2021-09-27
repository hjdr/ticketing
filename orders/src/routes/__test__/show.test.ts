import { Ticket } from '../../models/ticket';
import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('fetches the order', async () => {
  const user = global.signin();
  const ticket = Ticket.build({
    price: 20,
    title: 'concert',
  });
  await ticket.save();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set( 'Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id)
});

it('returns an error if the order is not found', async () => {
  const user = global.signin();
  const orderId = mongoose.Types.ObjectId();
  await request(app)
    .get(`/api/orders${orderId}`)
    .set('Cookie', user)
    .send()
    .expect(404);
});

it('returns an error if the order does not belong to the requesting user', async () => {
  const userOne = global.signin();
  const userTwo = global.signin();
  const ticket = Ticket.build({
    price: 20,
    title: 'concert',
  });
  await ticket.save();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set( 'Cookie', userOne)
    .send({ ticketId: ticket.id })
    .expect(201);

  request(app)
    .get(`/api/userTwo/${order.id}`)
    .set('Cookie', userTwo)
    .send()
    .expect(401);
});
