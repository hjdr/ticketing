import {
  OrderCancelledEvent,
  Publisher,
  Subjects,
} from '@hr-tickets-app/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
