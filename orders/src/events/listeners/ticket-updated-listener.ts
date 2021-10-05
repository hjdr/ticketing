import {
  Listener,
  Subjects,
  TicketUpdatedEvent,
} from '@hr-tickets-app/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;
  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const { price, title } = data;
    const ticket = await Ticket.findById(data.id);
    if (!ticket) throw new Error('Ticket not found');
    ticket.set({ price, title });
    await ticket.save();
    msg.ack();
  }
}
