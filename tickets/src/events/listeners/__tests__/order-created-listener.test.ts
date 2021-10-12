import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import {
  OrderCreatedEvent,
  OrderStatus,
} from '@hr-tickets-app/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const ticket = Ticket.build({
    price: 20,
    title: 'concert',
    userId: 'user-id123',
  });
  await ticket.save();
  const data: OrderCreatedEvent['data'] = {
    expiresAt: '3000',
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
    userId: 'user-id123',
    version: 0,
  };
  // @ts-ignore - only need ack property
  const msg: Message = {
    ack: jest.fn(),
  };
  return { data, listener, msg, ticket };
}

it('sets the userId of the ticket', async () => {
  const { data, listener, msg, ticket } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toBeDefined();
  expect(updatedTicket!.orderId).toEqual(data.id);

});

it('acks the message', async () => {
  const { data, listener, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { data, listener, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  expect(ticketUpdatedData.orderId).toEqual(data.id);
});
