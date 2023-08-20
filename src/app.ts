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
    await token.checkValidity();
    console.log(token.getToken());
    res.json(token.getToken());
});

app.use((req, res, next) => {
    req.token = {
        getToken() {
            return {
                "accessToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjgyNUNFNDQ5OEU3MzQyNEJEMTlEOUY3OUQ3NEIyOEFEIiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE2OTI1NTM1NzIsImV4cCI6MTY5MjU1NzE3MiwiaXNzIjoiaHR0cHM6Ly9hdXRoLnNoYXlyYWQuaXIiLCJjbGllbnRfaWQiOiJzaC1uYWctcGFrbGVhbiIsImlhdCI6MTY5MjU1MzU3Miwic2NvcGUiOlsibmFqaV9hcGlfc2NvcGUiXX0.INgzrRqbIhqt9n-DOree7WoJXOrYjfIHyc1OND8KU7cCn35LC1p315dlCuNuZmyz8jxnvhqAE3K_l3pcIXdvAh6LrUjqTaspmxE-9__xTt85G4vsUZIQFLwMDY1m_S2Zd7382ZbS1e73caBfPYCdcPA6QOIfwS2bF6DYGsF6Jb4Vq2wJIXAfWiEHgYzy05NbOc9jnF0LG9vR44mah0vvux43vaLzEHzjZP2O39lKldA4WdUl3F1ywGhXmmF_fMBUS2qTdZ7HtmdpL8NxkkvNPpJQrATFP8qD6nrJlRp0a_sDr1zapRABiqKCINeTBZTHnqFrWOEntPdo9dWgoAPlVA",
                "tokenType": "Bearer",
                "scope": "naji_api_scope",
                "createdAt": 1692553580815,
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