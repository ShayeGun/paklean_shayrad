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
        "accessToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjgyNUNFNDQ5OEU3MzQyNEJEMTlEOUY3OUQ3NEIyOEFEIiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE2OTAyODQ2NzEsImV4cCI6MTY5MDI4ODI3MSwiaXNzIjoiaHR0cHM6Ly9hdXRoLnNoYXlyYWQuaXIiLCJjbGllbnRfaWQiOiJzaC1uYWctcGFrbGVhbiIsImlhdCI6MTY5MDI4NDY3MSwic2NvcGUiOlsibmFqaV9hcGlfc2NvcGUiXX0.RNJO0LSpCmp3_q-w4KwQifsWGiwfAwssfMiHZlEIiJlyYTAmFUF2szXy2hEc_emB7DjiRcriTKwHEfKlLF8yPvs17x6tv5kv9xjiLmAt9RgQAuKpuAzrVzb_ac4CIcqruhg0QPFPJjEdIoNzMA83Fwk5g0dty1bc6Pak-o-u3ZcYbyTRYrQ2eBq5-SJ6I9bVhjbaPpS-I-Gg9QRWad8AIXKjin8hA-0x1mj9scJeYTZzMJl6vYEINQT2YWkEMVrT_tcHK1DEFJiXJoyE50ihrHiuPWSi1gofvsTcO5VuD9rYeKiYXRTZmdnOgdkz5m-goIaiOiS8duvgWej2RL3vGg",
        "tokenType": "Bearer",
        "scope": "naji_api_scope",
        "createdAt": 1690284649391,
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