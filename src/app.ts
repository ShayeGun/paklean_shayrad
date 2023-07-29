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
                "accessToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjgyNUNFNDQ5OEU3MzQyNEJEMTlEOUY3OUQ3NEIyOEFEIiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE2OTA2MjY0MDgsImV4cCI6MTY5MDYzMDAwOCwiaXNzIjoiaHR0cHM6Ly9hdXRoLnNoYXlyYWQuaXIiLCJjbGllbnRfaWQiOiJzaC1uYWctcGFrbGVhbiIsImlhdCI6MTY5MDYyNjQwOCwic2NvcGUiOlsibmFqaV9hcGlfc2NvcGUiXX0.p17djHbGL31-Aho0Wi3_Ugmw2M1qrIPyS1otB33ulX4CXHdSveqTW2-ebYx0buC4p5rQ5CsXtc8CmOtBxwPLi2pUOP3Gb2jaiIKqvPJRCyuTTTMvwZryEruymspYM4nRQLJ86jpfLu4VG5Rta4Qt3Ww-NR2rQLIRC-n9tbIeIuYINkBvLbA0BH8nlQtN2G4yv8yMXO8oflkrviDD84q8C_6bO0ksvX84NtrWQuJI3JA922JxDhf-YKNygnHBvXzmSC1bRnOCrcwMcwVeUfZSE-RQNZdOWCMDFPJ68iYZrYJVl-7_7Zvg1T2x35TP6RyZg3of_a8HO6z5J1MgsQnc6g",
                "tokenType": "Bearer",
                "scope": "naji_api_scope",
                "createdAt": 1690626385199,
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