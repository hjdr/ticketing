import { MongoMemoryServer } from 'mongodb-memory-server';
const mongoose = require('mongoose');
import jwt from 'jsonwebtoken';

declare global {
  var signin: (id?: string) => Array<string>;
}

jest.mock('../nats-wrapper.ts');

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = 'some-key';
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach( async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = () => {
  const randomId = new mongoose.Types.ObjectId().toHexString();
  const payload = {
    id: randomId,
    email: 'test-user@test.com',
  };
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  const session = { jwt: token };
  const sessionJson = JSON.stringify(session);
  const base64 = Buffer.from(sessionJson).toString('base64');
  return [`express:sess=${base64}`];
};
