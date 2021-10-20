import mongoose from 'mongoose';
import { OrderStatus } from '@hr-tickets-app/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface OrderAttrs {
  id: string;
  price: number;
  status: OrderStatus;
  userId: string;
  version: number;
}

interface OrderDoc extends mongoose.Document {
  price: number;
  status: OrderStatus;
  userId: string;
  version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema({
  price: {
   required: true,
   type: Number,
  },
  status: {
    enum: Object.values(OrderStatus),
    default: OrderStatus.Created,
    required: true,
    type: String,
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

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    price: attrs.price,
    status: attrs.status,
    userId: attrs.userId,
    version: attrs.version,
  });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
