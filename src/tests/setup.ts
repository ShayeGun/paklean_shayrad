// import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
    // must be var (let / const won't work)
    var signin: () => string[];
    var mongooseID: string;
}

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URL!)


});

afterEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        // clear all mongodb data related to previous tests
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    // terminate all connections to mongod-server
    // await mongoose.connection.close();
    // await mongod.stop();
    // await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
});

// faking creating a session cuz we don't shouldn't get access to auth service
global.signin = () => {
    // 1) build a jwt payload. { id, email }
    const payload = {
        // randomly created id each time function has been called
        id: new mongoose.Types.ObjectId().toHexString(),
        email: "test@test.com"
    }

    // 2) create the jwt!
    const token = jwt.sign(payload, process.env.JWT_SECRET!)

    // 3) build session object. { jwt: MY_JWT }
    const session = { jwt: token }

    // 4) turn that JSON session into string
    const sessionJSON = JSON.stringify(session);

    // 5) take json and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // for updating purposes
    global.mongooseID = payload.id;

    // 6) return a string which contains cookie(encoded) 
    return [`session=${base64}`] // putting cookie inside an array is for making 'supertest' happy :)
}