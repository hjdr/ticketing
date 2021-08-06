import nats from 'node-nats-streaming';

console.clear();

const client = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
});

client.on('connect', () => {
  console.log('Publisher connected to NATS');
  const data = JSON.stringify(({
    id: 'DFGEW4DSFS345ASFF',
    price: 20,
    title: 'concert',
  }));

  client.publish('ticket:created', data, () => {
    console.log('Event published');
  });
});
