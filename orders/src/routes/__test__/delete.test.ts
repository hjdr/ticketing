import { Ticket } from '../../models/ticket';
import request from 'supertest';
import { app } from '../../app';
import {
  Order,
  OrderStatus,
} from '../../models/order';

it('marks an order status as cancelled', async () => {
  const ticket = Ticket.build({
    price: 20,
    title: 'concert',
  });
  await ticket.save();
  const user = global.signin();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it.todo('emits an order cancellation event');
