import * as mongoose from 'mongoose';
import {
  Order,
  OrderStatus,
} from './order';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface TicketAttrs {
  id: string;
  price: number
  title: string;
}

export interface TicketDoc extends mongoose.Document {
  isReserved(): Promise<boolean>;
  price: number;
  title: string;
  version: number;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: { id: string, version: number }): Promise<TicketDoc | null>
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

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) => new Ticket({
  _id: attrs.id,
  price: attrs.price,
  title: attrs.title,
});

ticketSchema.statics.findByEvent = (event: { id: string, version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
}

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
