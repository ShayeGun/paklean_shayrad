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
// app.use(catchAsync(async (req, res, next) => {
//     await token.checkValidity();
//     req.token = token;
//     next();
// }));

// FIX: for development only
app.get('/api/shayrad/v1/get-token', async (req, res, next) => {
    await token.checkValidity();
    console.log(token.getToken());
    res.json(token.getToken());
});

app.use((req, res, next) => {
    req.token = {
        getToken() {
            return {
                "accessToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjgyNUNFNDQ5OEU3MzQyNEJEMTlEOUY3OUQ3NEIyOEFEIiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE2OTMwNTg1NDQsImV4cCI6MTY5MzA2MjE0NCwiaXNzIjoiaHR0cHM6Ly9hdXRoLnNoYXlyYWQuaXIiLCJjbGllbnRfaWQiOiJzaC1uYWctcGFrbGVhbiIsImlhdCI6MTY5MzA1ODU0NCwic2NvcGUiOlsibmFqaV9hcGlfc2NvcGUiXX0.oRyLEiVzpZuSBI-6XAVnCI-0D95tin_Qo7bufXtt7wQgyPSnDFvt92v56WdyGi-wYSnkzv2XYHDDCG0ItzzWcymwBJjKXY5myGDQgSwoDpZmNpCs11SgFITiZOu3BVPC6m6YATIeixKrMlIzwKq76emC3aFVbpBykogrTfxXqZ8o9LzokvDp4t6UjQvz_4rNcBImPQ6qK2LrOPOFqmPU5no_vA3S07dqqq4DQp76oH-hGauIGbFB5VHhhaWA_a8kot2O__UtRhNUIVJWJ1XfhDhmOgBtFrUKo17y0yP6U8AFbaq3a7OVDaJ9w9yqPBWrqI-xjEJwOHjh0tiMTM6u7g",
                "tokenType": "Bearer",
                "scope": "naji_api_scope",
                "createdAt": 1693058551732,
                "expiresIn": 3600000
            };
        }

    };
    next();
});

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