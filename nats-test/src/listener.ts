import nats, { Message } from 'node-nats-streaming';

console.clear();

const client = nats.connect('ticketing', '123', {
  url: 'http://localhost:4222',
});

client.on('connect', () => {
  console.log('Listener connected to NATS');
  const subscription = client.subscribe('ticket:created');
  subscription.on('message', (msg: Message) => {
    const data = msg.getData() as string;
    console.log(`received event number: ${msg.getSequence()}, with data ${data}`);
  });
});

