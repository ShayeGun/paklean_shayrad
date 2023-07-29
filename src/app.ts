import express from 'express';
import cookieParser from "cookie-parser";
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import logger from 'morgan';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import { userRoute } from './routes/user-router';
import { errorHandler } from './middlewares/error-handler';
import { CustomError } from './utils/custom-error';
import { token } from './utils/token';
import { catchAsync } from './utils/catch-async';

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

// // FIX: for production only
// check validity of token with each request
// app.use(catchAsync(async (req, res, next) => {
//     await token.checkValidity()
//     console.log(token.getToken());

//     req.token = token;
//     next()
// }))

// FIX: for development only
app.get('/api/shayrad/v1/get-token', async (req, res, next) => {
    await token.checkValidity()
    console.log(token.getToken())
    res.json(token.getToken())
})

app.use((req, res, next) => {
    req.token = {
        getToken() {
            return {
                "accessToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjgyNUNFNDQ5OEU3MzQyNEJEMTlEOUY3OUQ3NEIyOEFEIiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE2OTA2NTc1MTgsImV4cCI6MTY5MDY2MTExOCwiaXNzIjoiaHR0cHM6Ly9hdXRoLnNoYXlyYWQuaXIiLCJjbGllbnRfaWQiOiJzaC1uYWctcGFrbGVhbiIsImlhdCI6MTY5MDY1NzUxOCwic2NvcGUiOlsibmFqaV9hcGlfc2NvcGUiXX0.E4ktHipUVc1hBAVwkhTFy7BfKBvhcjolMLMdKh4dfxKINLNwn4POcyYGjJJmlE6wKAkGsxv9xgzzVBSl1wwHWk6yuREsp_oW5CXhdyumQ6rME5apR2guTuYt9SI4bUXbocbLdL-UjvRfZP_xobl7RBXXCIQnEFTP11UQGt_JVVo_g-PJOJYh4TrYDE3pwWIyfqzVAJXwkzI1k0zbwL-5dFTYemyA-qPUXKUvpWF0IKrCshkUoipkV1hJZDSKpW3usvx9Mru5MGfq13vEBf8cfFIc5XnA-VrAwwo2k-UtJdTyRbOnEvHsBXURzVUBZC3394LlqRFJtRUN9KNqtUOeNA",
                "tokenType": "Bearer",
                "scope": "naji_api_scope",
                "createdAt": 1690657494748,
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
    return next(new CustomError('No Such URL Sry 🥲', 404, 404))

})

app.use(errorHandler)

export { app }