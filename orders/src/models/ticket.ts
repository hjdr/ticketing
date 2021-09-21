import * as mongoose from 'mongoose';
import {
  Order,
  OrderStatus,
} from './order';

interface TicketAttrs {
  price: number
  title: string;
}

export interface TicketDoc extends mongoose.Document {
  isReserved(): Promise<boolean>;
  price: number;
  title: string;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema({
  price: {
    min: 0,
    required: true,
    type: Number,
  },
  title: {
    required: true,
    type: String,
  },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    }
  },
});

ticketSchema.statics.build = (attrs: TicketAttrs) => new Ticket(attrs);
ticketSchema.methods.isReserved = async function() {
  const existingOrder = await Order.findOne({
    status: {
      $in: [
        OrderStatus.AwaitingPayment,
        OrderStatus.Created,
        OrderStatus.Complete,
      ],
    },
    ticket: this as any,
  });
  return !!existingOrder;
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
