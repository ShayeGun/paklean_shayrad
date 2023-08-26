import express from 'express';
import cookieParser from "cookie-parser";
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import logger from 'morgan';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import { userRoute } from './routes/index-router';
import { errorHandler } from './middlewares/error-handler';
import { CustomError } from './utils/custom-error';
import { token } from './utils/token';
import { catchAsync } from './utils/catch-async';
import fs from 'node:fs';
import yaml from 'js-yaml';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger('dev'));

// =========== SECURITY ===========
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'give a break to server for one hour 😮‍💨'
});

app.use(express.json({ limit: '10kb' }));
app.use(helmet());
app.use(cors());
app.use(ExpressMongoSanitize());
app.use('/api', limiter);

// =========== END SECURITY ===========

// FIX: for production only
// check validity of token with each request
app.use(catchAsync(async (req, res, next) => {
    await token.checkValidity();
    req.token = token;
    next();
}));

// FIX: for development only
// app.get('/api/shayrad/v1/get-token', async (req, res, next) => {
//     await token.checkValidity();
//     console.log(token.getToken());
//     res.json(token.getToken());
// });

// app.use((req, res, next) => {
//     req.token = {
//         getToken() {
//             return {
//                 "accessToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjgyNUNFNDQ5OEU3MzQyNEJEMTlEOUY3OUQ3NEIyOEFEIiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE2OTMwMzMwNTEsImV4cCI6MTY5MzAzNjY1MSwiaXNzIjoiaHR0cHM6Ly9hdXRoLnNoYXlyYWQuaXIiLCJjbGllbnRfaWQiOiJzaC1uYWctcGFrbGVhbiIsImlhdCI6MTY5MzAzMzA1MSwic2NvcGUiOlsibmFqaV9hcGlfc2NvcGUiXX0.GnAmb4V9ll_SfTDeLZCmUPYc34SS1J038cFJ1QG6THtxZvMwogadgIeGFLcDjZyljvALDWdPPFaEXjxk7U3tGEH1gn7azMLAu7U2T5Q1GNBpJOAu3VrAjX8rbJdK4o7xnbPdt5xFeWrlgNQTEdjkiBdKI9a0va7HOP6GB2le1d5nXcui8auasQiMGUuysQtioFn4a2Pm7cOS-lBBpr18-iS8AmD-DAK9yW5uFC9fAgXaB_4Vkulk5USvRnYwFj1jAyzyBWQ-sPzBiDdfFtnBY2ab1IxlqYjY_ZvIal2l2v3G2ixojp7d8PKok6Ws-e5Cq4MNtcoAmmxglNrHckbZpQ",
//                 "tokenType": "Bearer",
//                 "scope": "naji_api_scope",
//                 "createdAt": 1693033059290,
//                 "expiresIn": 3600000
//             };
//         }

//     };
//     next();
// });

const options = yaml.load(fs.readFileSync(`${__dirname}/../swagger.yaml`, 'utf8'));

const swaggerSpec = swaggerJSDoc(options!);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// FIX:
app.route('/api/shayrad/v1/hello')
    .all(async (req, res) => {

        res.send('hello baby 😉');
    });

app.use('/api/shayrad/v1/user', userRoute);

app.use('*', (req, res, next) => {
    return next(new CustomError('No Such URL Sry 🥲', 404, 404));

});

app.use(errorHandler);

export { app };