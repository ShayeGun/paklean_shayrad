import request from "supertest";
import { app } from "../app";
import mongoose from "mongoose";

describe('server stuff', () => {
    it('check server availability', async () => {
        const response = await request(app).get('/api/v1/hello');
        expect(response.status).toBe(200)

    })
})

