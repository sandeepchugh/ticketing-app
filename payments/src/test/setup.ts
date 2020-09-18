import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
    namespace NodeJS {
        interface Global {
            signin(id?:string): string 
        }
    }
} 

jest.mock('../nats-wrapper');
jest.mock('../stripe');

let mongo: any;

beforeAll(async () => {
    jest.clearAllMocks();
    process.env.JWT_KEY = "testsecretkey";

    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();
    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
});

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        collection.deleteMany({});
    }
});

afterAll( async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

global.signin = (id?: string) => {
    const email = 'test@test.com'
    id = id || new mongoose.Types.ObjectId().toHexString();

    const payload = {id, email};

    const token = jwt.sign(payload, process.env.JWT_KEY!);

    const session = {jwt: token};
    
    const sessionJson = JSON.stringify(session);

    const base64 = Buffer.from(sessionJson).toString('base64');

    return `express:sess=${base64}`;
};