import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from '@hr-tickets-app/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated
}
