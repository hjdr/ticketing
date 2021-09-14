import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from '@hr-tickets-app/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated
}
