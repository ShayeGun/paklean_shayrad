import express from 'express';
import cookieParser from "cookie-parser";
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import logger from 'morgan';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import { userRoute } from './routes/user-router';
import { errorHandler } from './controllers/error-handler';
import { CustomError } from './utils/custom-error';
import { token } from './utils/token';

const app = express();
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(logger('dev'));

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
        getToken() {
            return {
                "accessToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjgyNUNFNDQ5OEU3MzQyNEJEMTlEOUY3OUQ3NEIyOEFEIiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE2OTAyOTI5NDAsImV4cCI6MTY5MDI5NjU0MCwiaXNzIjoiaHR0cHM6Ly9hdXRoLnNoYXlyYWQuaXIiLCJjbGllbnRfaWQiOiJzaC1uYWctcGFrbGVhbiIsImlhdCI6MTY5MDI5Mjk0MCwic2NvcGUiOlsibmFqaV9hcGlfc2NvcGUiXX0.sieKOVj7SzHRvD5EXW1JiBGAxSplf83LmzEw1tpji6HWxvj1JiLTe_1qVp8rPRiW8CIM7EEuqFTwG6QurNx-gU2C4LbpfCaFQCjodrt2NWk808020-raGEWVzvsVxHG1lwUS15SFMhN_KLQ2qaX3XLSodHlk34O90YShv7m1tcAA_r-fltp6ZYLC_zfJMe_7CgxBDicX7ls2P1HTR07uSHR_Ex8y_eqIeNo2gYz-bfM6r7BA5yrnlEobJ4BXJP7TMEkAypOTEfT52k6EkHfhKqDjJbWg_8cGSxR96AFr3M5SgXMcxF0fE4xFD0yrdM8GU-EaUuRkxQ9du9JNcm4dCQ",
                "tokenType": "Bearer",
                "scope": "naji_api_scope",
                "createdAt": 1690292918653,
                "expiresIn": 3600000
            }
        }

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