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
                "accessToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjgyNUNFNDQ5OEU3MzQyNEJEMTlEOUY3OUQ3NEIyOEFEIiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE2OTA5MDk0NTUsImV4cCI6MTY5MDkxMzA1NSwiaXNzIjoiaHR0cHM6Ly9hdXRoLnNoYXlyYWQuaXIiLCJjbGllbnRfaWQiOiJzaC1uYWctcGFrbGVhbiIsImlhdCI6MTY5MDkwOTQ1NSwic2NvcGUiOlsibmFqaV9hcGlfc2NvcGUiXX0.aQpvQ-oqv6LrlhaVatoGjL9fWB4Yklj1MPEAlHXVfUn4k89z7LDa_bF3x_YSFqZbWq_-zddbIq6HWUUkgWGeFPxpvgIL-F1d3bpU7TSaNMkT1_7jt3DMaPzno4MWW1dvvMyP3NRPOVw70nkt47TQIR0bEjTYXaHFZQMCgTINbUmKUhWs6u0FrxEviT14aWzJN1yLU8XyN2RJCKYkMcxbx2tRCVKevXXmxJkeEoh5s1jHn-XJiFJnsNHrlkdvNBnDxidJfWq7VXNrne2ubIJxJPmNS9aZRj4NfZhGuEWp1_Rur2rf7Q4ETfDxXUpgdzgmbR6EGPjYavNFTbpR1GOKyQ",
                "tokenType": "Bearer",
                "scope": "naji_api_scope",
                "createdAt": 1690909427926,
                "expiresIn": 3600000
            }
        }

    }
    next()
})

const options = yaml.load(fs.readFileSync(`${__dirname}/../swagger.yaml`, 'utf8'));

const swaggerSpec = swaggerJSDoc(options!);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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