import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/sign-in';
import { signoutRouter} from './routes/sign-out';
import { signupRouter } from './routes/sign-up';
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
    secure: false,
  }),
);
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

// route should always be last
app.all('*', async (
  req,
  res,
) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
