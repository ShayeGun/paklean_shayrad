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
        "accessToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjgyNUNFNDQ5OEU3MzQyNEJEMTlEOUY3OUQ3NEIyOEFEIiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE2OTAyMTE1ODIsImV4cCI6MTY5MDIxNTE4MiwiaXNzIjoiaHR0cHM6Ly9hdXRoLnNoYXlyYWQuaXIiLCJjbGllbnRfaWQiOiJzaC1uYWctcGFrbGVhbiIsImlhdCI6MTY5MDIxMTU4Miwic2NvcGUiOlsibmFqaV9hcGlfc2NvcGUiXX0.sVBrDguOf1Kby_0QMmouxgjW_eX8Tr7UbD9iNrFqL-TteBBf5xntrGSP63vbvivohz1XLKa_uaTIGHGovylxlT2wf8TYOCo30Y_H_PBiJAjtOwKmjxyYp0rMWoM6qm1qiZbg9nmIxlPA10k42r9WDIwy49xEtqPy5zridPps7wI9PX5QWrJDLF6V9wEbgu6xWe-W3mDn0X5UF3I7K18t_TGYqO3yyDiq8LlLlOjDjCGCsvoPB1CugpsjdNmvh3lAH2VuOaC0RLVi-xh6jfKKc6FYs08J3EjvQPTvivU4Mz19VcR51ipNZI5cWalg8gHcAuXFXwGrN_VwSzDJtWZbww",
        "tokenType": "Bearer",
        "scope": "naji_api_scope",
        "createdAt": 1690211560857,
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