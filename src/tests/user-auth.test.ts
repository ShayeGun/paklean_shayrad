import request from "supertest";
import { verifyJWT } from "../utils/jwt-handler";
import { expect, jest, test } from '@jest/globals';
import { app } from "../app";
import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import { User } from "../models/user";

// ===================== SIGNUP USER =====================

describe('user signup', () => {
    const signupURL = '/api/v1/user/signup'
    const credential = {
        firstName: "shayegan",
        lastName: "amouei",
        password: "Shy7200@",
        nationalCode: "0022553975",
        phone: "09384009969",
        email: "shy@gmail.com"
    }

    it('signup user with wrong METHOD', async () => {
        const response = await request(app).get(signupURL);

        expect(response.body.status).toBe('fail');
        expect(response.status).toBe(404);
    })

    it('signup user with no body', async () => {
        const response = await request(app).post(signupURL).send();

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.code).toBe(1102)

    })


    it('signup user with wrong email', async () => {
        const response = await request(app).post(signupURL).send({
            "firstName": "shayegan",
            "lastName": "amouei",
            "password": "Shy7200@",
            "nationalCode": "0022553975",
            "phone": "09384009969"
        });
        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.code).toBe(1102)

    })


    it('signup user with wrong national code and phone number', async () => {
        const response = await request(app).post(signupURL).send({
            "firstName": "shayegan",
            "lastName": "amouei",
            "password": "Shy7200@",
            "nationalCode": "002255397",
            "phone": "0938400996e",
            "email": "shy@gmail.com"
        });
        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.code).toBe(1102)

    })

    it('signup user  with correct credential', async () => {
        const response = await request(app).post(signupURL).send(credential);
        expect(response.status).toBe(201)
        expect(response.body.status).toBe('success');

    })

    it('signup user  extra credential', async () => {
        const response = await request(app).post(signupURL).send({
            ...credential,
            test1: "test1",
            test2: "test2"
        });

        expect(response.status).toBe(201)
        expect(response.body.status).toBe('success');

    })

    it('signup already existed user', async () => {

        await request(app).post(signupURL).send(credential);

        const response = await request(app).post(signupURL).send(credential);

        expect(response.status).toBe(400)
        expect(response.body.status).toBe('fail');
        expect(response.body.code).toBe(1101);

    })

    it('check if user get a signup jwt token', async () => {

        const response = await request(app).post(signupURL).send(credential);

        expect(response.body.token).not.toBeFalsy
            ();

    })

    it('verify jwt of a user', async () => {
        const response = await request(app).post(signupURL).send(credential);

        const token = response.body.token

        const decodedToken: any = await verifyJWT(token);

        expect(response.body.user._id).toBe(decodedToken.id);

    })


    it('verify jwt expiration date', async () => {
        function sleep(ms: number) {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        }
        const response = await request(app).post(signupURL).send(credential);

        const token = response.body.token

        await sleep(2000);

        const result: any = await verifyJWT(token);

    })
})


// ===================== SIGNIN USER =====================

describe('user signin', () => {

    const testSignup = async () => {
        const user = new User({
            firstName: "shayegan",
            lastName: "amouei",
            password: "Shy7200@",
            nationalCode: "0022553975",
            phone: "09384009969",
            email: "shy@gmail.com"
        });
        await user.save();
    };

    beforeEach(async () => {
        await testSignup();
    })

    const credential = {
        nationalCode: '0022553975',
        password: 'Shy7200@'
    }

    const signinURL = '/api/v1/user/signin'

    it('signin user with wrong METHOD', async () => {
        const response = await request(app).get(signinURL);

        expect(response.body.status).toBe('fail');
        expect(response.status).toBe(404);
    })

    it('signin user with no body', async () => {
        const response = await request(app).post(signinURL).send();

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('fail');
        expect(response.body.code).toBe(1001)

    })


    it('signin user with wrong national code', async () => {
        const response = await request(app).post(signinURL).send({
            nationalCode: '0033553975'
        });

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('fail');
        expect(response.body.code).toBe(1001);

    })

    it('signin user with correct national code and wrong password', async () => {
        const response = await request(app).post(signinURL).send({
            nationalCode: '0022553975',
            password: 'salam123'
        });

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('fail');
        expect(response.body.code).toBe(1002);

    })

    it('signin user with correct national code and password and extra data', async () => {
        const response = await request(app).post(signinURL).send({
            ...credential,
            test1: 'test1',
            test2: 'test2'
        });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.token).not.toBeFalsy();
    })

    it('signin user with correct national code and password and gets jwt token', async () => {
        const response = await request(app).post(signinURL).send(credential);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.token).not.toBeFalsy();
    })

    it('verify jwt of a user', async () => {
        const response = await request(app).post(signinURL).send(credential);

        const token = response.body.token

        const decodedToken: any = await verifyJWT(token);

        expect(response.body.user._id).toBe(decodedToken.id);
    })
})

// ================= mocking signup =================
const mockSignup = jest.fn(() => {
    // randomly created id each time function has been called
    const id = new mongoose.Types.ObjectId().toHexString()

    // 1) build a jwt payload. { id, email }
    const payload = { id }

    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: 10000 })

    // for updating purposes
    const currentUser = {
        status: 'success',
        token,
        user: {
            _id: id,
            firstName: "shayegan",
            lastName: "amouei",
            password: "Shy7200@",
            nationalCode: "0022553975",
            phone: "09384009969",
            email: "shy@gmail.com"
        },
    };

    return currentUser
}
);