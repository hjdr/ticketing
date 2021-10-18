import {
  ExpirationCompleteEvent,
  Listener,
  Subjects,
} from '@hr-tickets-app/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import {
  Order,
  OrderStatus,
} from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { natsWrapper } from '../../nats-wrapper';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');
    if (!order) throw Error('Order not found');
    order.set({ status: OrderStatus.Cancelled });
    await order.save();
    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      ticket: {
        id: order.ticket.id,
      },
      version: order.version,
    });
    msg.ack();
  }
}
