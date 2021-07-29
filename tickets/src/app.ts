import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { createTicketRouter } from './routes/new';
import {
  currentUser,
  errorHandler,
  NotFoundError,
} from '@hr-tickets-app/common';
import cookieSession from 'cookie-session';
import { showTicketRouter } from './routes/show';

const app = express();
app.use(json());
app.set('trust proxy', true);
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  }),
);
app.use(currentUser);
app.use(createTicketRouter);
app.use(showTicketRouter);

// route should always be last
app.all('*', async (
  req,
  res,
) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
