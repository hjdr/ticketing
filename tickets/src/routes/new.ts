import express, { Request, Response } from 'express';
import {
  requireAuth,
  validateRequest,
} from '@hr-tickets-app/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater then 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
  const { price, title } = req.body;
  const ticket = Ticket.build({
    userId: req.currentUser!.id,
    price,
    title,
  });
    await ticket.save();
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
    })

    res.status(201).send(ticket)
});

export { router as createTicketRouter };
