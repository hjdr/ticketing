import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import { TicketUpdatedEvent } from '@hr-tickets-app/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);
  const ticket = await Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 20,
    title: 'concert',
  });
  await ticket.save();

  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    price: 999,
    title: 'new concert',
    userId: mongoose.Types.ObjectId().toHexString(),
    version: ticket.version + 1,
  };

  // @ts-ignore - only need ack property
  const msg: Message = {
    ack: jest.fn(),
  };

  return { data, listener, msg, ticket };
}

it('finds, updates and saves a ticket', async () => {
  const { data, listener, msg, ticket } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { data, listener, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});


it('does not ack the message if the event version is not one version ahead', async () => {
  const { data, listener, msg, ticket } = await setup();
  data.version = 10;
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
