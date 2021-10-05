import {
  Listener,
  Subjects,
  TicketCreatedEvent,
} from '@hr-tickets-app/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { id, price, title } = data;
    const ticket = Ticket.build({
      id,
      price,
      title,
    });
    await ticket.save();
    msg.ack();
  }
}
