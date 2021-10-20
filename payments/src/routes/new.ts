import express, {
  Request,
  Response,
} from 'express';
import {
  BadRequestError,
  NotAuthorisedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@hr-tickets-app/common';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { stripe } from '../stripe';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [
    body('token').not().isEmpty().withMessage('must include a token'),
    body('orderId').not().isEmpty().withMessage('must include an order ID'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId, token } = req.body;
    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError();
    if (order.userId !== req.currentUser?.id) throw new NotAuthorisedError();
    if(order.status === OrderStatus.Cancelled) throw new BadRequestError('Cannot charge cancelled orders');
    const payment = await stripe.charges.create({
      amount: order.price * 100,
      currency: 'gbp',
      source: token,
    })
    console.log(payment);
    res.send({ success: true });
});

export { router as createChargeRouter };
