import request from 'supertest';
import { app } from '../../app';

it('returns a 404 if the ticket is not found', async () => {
  await request(app)
    .get('/api/ticket/some-incorrect-id')
    .send()
    .expect(404);
});

it('returns the ticket if the ticket is found', async () => {
  const title = 'concert';
  const price = 20;

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ price, title })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

    expect(ticketResponse.body.price).toEqual(20);``
    expect(ticketResponse.body.title).toEqual(title);
});
