import mongoose from 'mongoose';

interface TicketAttrs {
  price: number;
  title: string;
  userId: string;
}

interface TicketDoc extends mongoose.Document {
  price: number;
  title: string;
  userId: string;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}
