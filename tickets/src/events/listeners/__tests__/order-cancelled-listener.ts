import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { Message } from 'node-nats-streaming';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { OrderCancelledEvent } from '@hr-tickets-app/common';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const orderId = mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    price: 20,
    userId: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
  });
  ticket.set({ orderId })
  await ticket.save();
  const data: OrderCancelledEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    ticket: {
      id: ticket.id,
    },
    version: ticket.version,
  };
  // @ts-ignore - only need ack property
  const msg: Message = {
    ack: jest.fn(),
  };
  return { data, listener, msg, orderId, ticket }
};

it('updates the ticket, publishes the event and acks the message', async () => {
  const { data, listener, msg, orderId, ticket } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toBeUndefined();
  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
  expect(ticketUpdatedData.orderId).toBeUndefined();
  expect(msg.ack).toHaveBeenCalled();
});
