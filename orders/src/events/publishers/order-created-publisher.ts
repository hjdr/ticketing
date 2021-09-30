import {
  OrderCreatedEvent,
  Publisher,
  Subjects,
} from '@hr-tickets-app/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
