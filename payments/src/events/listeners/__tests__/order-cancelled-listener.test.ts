import { natsWrapper } from '../../../nats-wrapper';
import {
  OrderCancelledEvent,
  OrderStatus,
} from '@hr-tickets-app/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 25,
    status: OrderStatus.Created,
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
  })
  await order.save();
  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    ticket: {
      id: mongoose.Types.ObjectId().toHexString(),
    },
    version: 1,
  };
  // @ts-ignore - only need ack property
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg };
}

it('throws an error if the versions are out of sync', async () => {
  const { listener, data, msg } = await setup();
  data.version = 2;
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}
  expect(msg.ack).not.toHaveBeenCalled();
});

it('throws an error if IDs dont match', async () => {
  const { listener, data, msg } = await setup();
  data.id = 'some-incorrect-id';
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}
  expect(msg.ack).not.toHaveBeenCalled();
});

it('amends the order status to cancelled', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const order = await Order.findById(data.id);
  expect(order!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
