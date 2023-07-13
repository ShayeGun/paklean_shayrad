import request from "supertest";
import { app } from "../app";

describe('user authentication', () => {
    it('signup user  with wrong email', async () => {
        const response = await request(app).post('/user/signup').send({


        });
        expect(response.status).toBe(200)

    })
})

