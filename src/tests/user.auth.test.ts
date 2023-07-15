import request from "supertest";
import { app } from "../app";
import mongoose from "mongoose";

describe('user authentication', () => {
    it('signup user  with wrong email', async () => {
        const response = await request(app).post('/api/v1/user/signup').send({
            "firstName": "shayegan",
            "lastName": "amouei",
            "password": "Shy7200@",
            "nationalCode": "0022553975",
            "phone": "09384009969"
        });
        expect(response.status).toBe(401)

    })

    it('signup user  with correct credential', async () => {
        const response = await request(app).post('/api/v1/user/signup').send({
            "firstName": "shayegan",
            "lastName": "amouei",
            "password": "Shy7200@",
            "nationalCode": "0022553975",
            "phone": "09384009969",
            "email": "shy@gmail.com"
        });
        expect(response.status).toBe(201)

    })
})

