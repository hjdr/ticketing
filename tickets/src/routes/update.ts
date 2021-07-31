import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorisedError,
} from '@hr-tickets-app/common';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title')
      .not()
      .isEmpty()
      .withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price is required and must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) throw new NotFoundError();
    if (ticket.userId !== req.currentUser!.id) throw new NotAuthorisedError();
    ticket.set({
      price: req.body.price,
      title: req.body.title,
    });
    await ticket.save();
    res.send(ticket);
  },
);

export { router as updateTicketRouter };
