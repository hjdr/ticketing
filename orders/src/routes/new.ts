import express, {
  Request,
  Response,
} from 'express';
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@hr-tickets-app/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 60;

router.post('/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .withMessage('TicketId must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
  const { ticketId } = req.body;
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new NotFoundError();
  const isReserved = await ticket.isReserved();
  if (isReserved) throw new BadRequestError('Ticket already reserved');
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
  const order = Order.build({
    expiresAt: expiration,
    status: OrderStatus.Created,
    ticket,
    userId: req.currentUser!.id,
  });
  await order.save();
  await new OrderCreatedPublisher(natsWrapper.client).publish({
    expiresAt: order.expiresAt.toISOString(),
    id: order.id,
    status: order.status,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
    userId: order.userId,
    version: order.version,
  });
  res.status(201).send(order);
});

export { router as newOrderRouter };
