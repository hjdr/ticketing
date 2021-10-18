import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from '@hr-tickets-app/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
