import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from '@hr-tickets-app/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
