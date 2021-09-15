import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';

jest.mock('../nats-wrapper.ts');

process.env.STRIPE_KEY = 'sk_test_01rVdWJLVYXWqij8iu2QrmMc';

let mongo: any;

beforeAll(async () => {
    process.env.JWT_KEY = 'test';

    mongo = await MongoMemoryServer.create();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri);
});

beforeEach(async () => {
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