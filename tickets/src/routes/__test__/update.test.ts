import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns a 404 if the provided id does not exist', async () => {
  const id =  new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      price: 20,
      title: 'test-title',
    })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const id =  new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      price: 20,
      title: 'test-title',
    })
    .expect(401);
});

it('returns a 401 if user does not own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      price: 20,
      title: 'test-ticket',
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      price: 25,
      title: 'test-ticket',
    })
    .expect(401);
});

it('returns a 400 if the provided price or title is invalid', async () => {
  const cookie = global.signin()
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      price: 20,
      title: 'test-ticket',
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      price: 20,
      title: '',
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      price: -20,
      title: 'test-ticket',
    })
    .expect(400);
});

it('updates the ticket provided valid inputs', async () => {
  const cookie = global.signin()
  const newTicketResponse = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      price: 20,
      title: 'test-ticket',
    });

  await request(app)
    .put(`/api/tickets/${newTicketResponse.body.id}`)
    .set('Cookie', cookie)
    .send({
      price: 25,
      title: 'new-title',
    })
    .expect(200);

  const AmendedTicketResponse = await request(app)
    .get(`/api/tickets/${newTicketResponse.body.id}`)
    .send();

  expect(AmendedTicketResponse.body.title).toEqual('new-title');
  expect(AmendedTicketResponse.body.price).toEqual(25);
});
