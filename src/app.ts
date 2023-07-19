import express from 'express';
import cookieParser from "cookie-parser";
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit'
import ExpressMongoSanitize from 'express-mongo-sanitize';
import { userRoute } from './routes/user-router';
import { errorHandler } from './controllers/error-handler';
import { CustomError } from './utils/custom-error';
import { Token, token } from './utils/token';
import { catchAsync } from './utils/catch-async';

const app = express();
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

// =========== SECURITY ===========
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'give a break to server for one hour 😮‍💨'
})

app.use(express.json({ limit: '10kb' }));
app.use(helmet());
app.use(cors());
app.use(ExpressMongoSanitize());
app.use('/api', limiter);

// =========== END SECURITY ===========

// check validity of token with each request
// app.use(catchAsync(async (req, res, next) => {
//     await token.checkValidity()
//     next()
// }))

// FIX: for development only
app.get('/api/shayrad/v1/get-token', async (req, res, next) => {
    await token.checkValidity()
    console.log(token.getToken())
    res.json(token.getToken())
})

// FIX: for development only
app.use((req, res, next) => {
    req.token = {
        "accessToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjgyNUNFNDQ5OEU3MzQyNEJEMTlEOUY3OUQ3NEIyOEFEIiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE2ODk3NjgzNDIsImV4cCI6MTY4OTc3MTk0MiwiaXNzIjoiaHR0cHM6Ly9hdXRoLnNoYXlyYWQuaXIiLCJjbGllbnRfaWQiOiJzaC1uYWctcGFrbGVhbiIsImlhdCI6MTY4OTc2ODM0Miwic2NvcGUiOlsibmFqaV9hcGlfc2NvcGUiXX0.AXZN4qmNXyszQSW7fvfyZvl7RuxoAh8C2IT51lCP8xBQxhrYMpcyWOYkNdFdDO_lIf5dO7RIsMLzlYDEolFadNRXeZwdFRTq-ttuXl_mz_JlAeeSoxdlPmB4ogs2oEvXBuZG4f06k7SOvqsGI-nCSnp45VYjunyW6SzA7MOH5A8GQ2aTfWTxg0mBXL2MwZcVIhvsCY-nvMHXNV9zsQZxKSj04iSUODq_T7fKiXAnzYw3oSpZALl249LhAvNaRlA1t2lVEeeBiDwao_tr9VON-rby2ghW9lGjkO3d0Fprp4YY6DmTQSOlwGPbZ6LyiCkiVtsy-pPFM7wb-dSv1qeVTQ",
        "tokenType": "Bearer",
        "scope": "naji_api_scope",
        "createdAt": 1689768326533,
        "expiresIn": 3600000
    }
    next()
})

// FIX:
app.route('/api/shayrad/v1/hello')
    .all(async (req, res) => {

        res.send('hello baby 😉')
    })

app.use('/api/shayrad/v1/user', userRoute);

app.use('*', (req, res, next) => {
    next(new CustomError('No Such URL Sry 🥲', 404, 404))
})

app.use(errorHandler)

export { app }