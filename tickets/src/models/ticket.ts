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

const ticketSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    }
  },
});

ticketSchema.statics.build = (attrs: TicketAttrs) => new Ticket(attrs)

// create model
export const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

