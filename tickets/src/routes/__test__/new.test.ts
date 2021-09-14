import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

const URL = '/api/tickets'

it('has a route handler listening to /api/tickers for post requests', async () => {
  const response = await request(app)
    .post(URL)
    .send({});
  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  await request(app)
    .post(URL)
    .send({})
    .expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post(URL)
    .set('Cookie', global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {
  await request(app)
    .post(URL)
    .set('Cookie', global.signin())
    .send({
      price: 10,
    })
    .expect(400);

  await request(app)
    .post(URL)
    .set('Cookie', global.signin())
    .send({
      price: 10,
      title: '',
    })
    .expect(400);

});

it('returns an error if an invalid price is provided', async () => {
  await request(app)
    .post(URL)
    .set('Cookie', global.signin())
    .send({
      title: 'test-title',
    })
    .expect(400);

  await request(app)
    .post(URL)
    .set('Cookie', global.signin())
    .send({
      price: -10,
      title: 'test-title',
    })
    .expect(400);
});

it('creates as ticket with valid inputs', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post(URL)
    .set('Cookie', global.signin())
    .send({
      price: 20,
      title: 'test-title',
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(20);
});

it('publishes the event', async () => {
  const title = 'efawegwg';

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price: 20,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
