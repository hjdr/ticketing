import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import {
  ExpirationCompleteEvent,
  OrderStatus,
} from '@hr-tickets-app/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 25,
    title: 'concert',
  });
  await ticket.save();
  const order = Order.build({
    expiresAt: new Date(),
    status: OrderStatus.Created,
    ticket,
    userId: mongoose.Types.ObjectId().toHexString(),
  })
  await order.save();
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };
  return { data, listener, msg, order, ticket };
}

it('updates the order status to cancelled', async () => {
  const { data, listener, msg, order } = await setup();
  await listener.onMessage(data, msg);
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('publishes an OrderCancelled event', async () => {
  const { data, listener, msg, ticket } = await setup();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const updatedOrderData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  expect(updatedOrderData.ticket.id).toEqual(ticket.id);
});

it ('acks the message', async () => {
  const { data, listener, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
