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
                "accessToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjgyNUNFNDQ5OEU3MzQyNEJEMTlEOUY3OUQ3NEIyOEFEIiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE2OTA4MTYyMDQsImV4cCI6MTY5MDgxOTgwNCwiaXNzIjoiaHR0cHM6Ly9hdXRoLnNoYXlyYWQuaXIiLCJjbGllbnRfaWQiOiJzaC1uYWctcGFrbGVhbiIsImlhdCI6MTY5MDgxNjIwNCwic2NvcGUiOlsibmFqaV9hcGlfc2NvcGUiXX0.eSoHJPQgiRxcZ7FJ_pQ7q0sVAx_Oe9kCRJUju0FNF_i7yheklJ43mpAdGIPp8zv4XkrpTWXJeEeeme2HHXm0KDjAXM-cCF_tRuEDPxjViAsrFHmaQV9TFSlCJOgIFnt0AJRYWtM2J-zR8MM6HuM6VAT7graS0PyWqW9_lkGyWyecy44izClfJZkZk6eiuXoW8zaRvuVpVpGvif982BPN2HVEr8LjGuM22oytOn_TPu2dcLwygaiATBqbCdln7GuMs6UXIasmuKZFYZSfdFAEi3M5KkoGodqUZy9NwV3Ns3kFmZ4XryFzPKCuBIRDMrrxlmILOi2EPAedR5McFQkKUA",
                "tokenType": "Bearer",
                "scope": "naji_api_scope",
                "createdAt": 1690816178201,
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