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
                "accessToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjgyNUNFNDQ5OEU3MzQyNEJEMTlEOUY3OUQ3NEIyOEFEIiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE2OTA1NjI0NDMsImV4cCI6MTY5MDU2NjA0MywiaXNzIjoiaHR0cHM6Ly9hdXRoLnNoYXlyYWQuaXIiLCJjbGllbnRfaWQiOiJzaC1uYWctcGFrbGVhbiIsImlhdCI6MTY5MDU2MjQ0Mywic2NvcGUiOlsibmFqaV9hcGlfc2NvcGUiXX0.I1LgoZQZGc6oyEwYcs3TqNxxAqVDzUtMhizzCKB7gMoXlcuxLCqtk4pDp-6XqmSp17LBQ0CQg_NQslZ7lf7LU30Ld9xiYdsBSwnuu825HLB-qVQk5JSiv_fvWvb34PimptwtCgVZFId1JkMckXqi4MDyZTn9kwnw4dba7jJjoYXK2_phr-DhBTUyYagA44CgVXeCUse90iRPaorar50LM9hr7D4oYR9ZQFUEB2A8npxaAbKfiTH18BlU1KaroKa9g7BxUQ8pXWGZsan1QOeI4RZkWRgeHw7uV9vENE8-LHroNRpIcGFU-R4zfHPyI1zEPZg60SNRzThttfmN7CZSuA",
                "tokenType": "Bearer",
                "scope": "naji_api_scope",
                "createdAt": 1690562420791,
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