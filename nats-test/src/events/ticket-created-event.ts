import { Subjects } from './subjects';

export interface TicketCreatedEvent {
  data: {
    id: string;
    price: number;
    title: string;
  }
  subject: Subjects.TicketCreated;
}
