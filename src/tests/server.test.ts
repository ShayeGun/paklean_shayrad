import request from "supertest";
import { app } from "../app";

describe('server stuff', () => {
    it('check server availability', async () => {
        const response = await request(app).get('/api/shayrad/v1/hello');
        expect(response.status).toBe(200)

    })
})

