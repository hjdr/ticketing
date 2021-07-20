import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';

import {
  errorHandler,
  NotFoundError,
} from '@hr-tickets-app/common';
import cookieSession from 'cookie-session';

const app = express();
app.use(json());
app.set('trust proxy', true);
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  }),
);

// route should always be last
app.all('*', async (
  req,
  res,
) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
