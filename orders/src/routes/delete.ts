import express, {
  Request,
  Response,
} from 'express';
import {
  Order,
  OrderStatus,
} from '../models/order';
import {
  NotAuthorisedError,
  NotFoundError,
  requireAuth,
} from '@hr-tickets-app/common';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete('/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId).populate('ticket');
  if (!order) throw new NotFoundError();
  if (order.userId !== req.currentUser!.id) throw new NotAuthorisedError();
  order.status = OrderStatus.Cancelled;
  await order.save();
  await new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    ticket: {
      id: order.ticket.id,
    },
    version: order.version,
  });
  res.status(204).send(order);
});

export { router as deleteOrderRouter };
