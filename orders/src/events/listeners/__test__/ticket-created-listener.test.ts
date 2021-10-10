import { TicketCreatedListener } from '../ticket-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedEvent } from '@hr-tickets-app/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // create a fake data event
  const data: TicketCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    title: 'concert',
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  };

  // create a fake message object
  // @ts-ignore - only need the ack function
  const msg: Message = {
    ack: jest.fn(),
  }

  return { data, listener, msg };
}

it('creates and saves a ticket', async () => {
  const { data, listener, msg } = await setup();
  // call onMessage with the data and message objects
  await listener.onMessage(data, msg);
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.price).toEqual(data.price);
  expect(ticket!.title).toEqual(data.title);

  // write assertions to make sure a ticket was created
});

it('acks the message', async () => {
  const { data, listener, msg } = await setup();
  // call onMessage with the data and message objects
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
  // write assertions to make sure ack function works
});
