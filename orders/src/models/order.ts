import * as mongoose from 'mongoose';
import { OrderStatus } from '@hr-tickets-app/common';
import { TicketDoc } from './ticket';

interface OrderAttrs {
  expiresAt: Date;
  status: OrderStatus;
  ticket: TicketDoc;
  userId: string;
}

interface OrderDoc extends mongoose.Document {
  expiresAt: Date;
  status: OrderStatus;
  ticket: TicketDoc;
  userId: string;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema({
  expiresAt: {
    type: mongoose.Schema.Types.Date,
  },
  status: {
    enum: Object.values(OrderStatus),
    default: OrderStatus.Created,
    required: true,
    type: String,
  },
  ticket: {
    ref: 'Ticket',
    type: mongoose.Schema.Types.ObjectId,
  },
  userId: {
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

orderSchema.statics.build = (attrs: OrderAttrs) => new Order(attrs);

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)

export { Order };
export { OrderStatus };
