import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URL!)


});

afterEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        // clear all mongodb data related to previous tests
        // NOTE : don't drop the DB or you'll get into trouble in validation
        await collection.deleteMany();
    }
});

afterAll(async () => {
    // terminate all connections to mongodb
    await mongoose.disconnect();
});
