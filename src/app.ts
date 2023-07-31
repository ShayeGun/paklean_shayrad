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
                "accessToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjgyNUNFNDQ5OEU3MzQyNEJEMTlEOUY3OUQ3NEIyOEFEIiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE2OTA3OTgzODMsImV4cCI6MTY5MDgwMTk4MywiaXNzIjoiaHR0cHM6Ly9hdXRoLnNoYXlyYWQuaXIiLCJjbGllbnRfaWQiOiJzaC1uYWctcGFrbGVhbiIsImlhdCI6MTY5MDc5ODM4Mywic2NvcGUiOlsibmFqaV9hcGlfc2NvcGUiXX0.IKWpyuQZK_VSGCmfkrW_dgoGt2by8ZHs6hpQ3oEEPatoTDSy3SsbNCFrpJqrIr34zoBhMqQmFBjWsmusjRSUq5ry3fzBD7ZyBAdZ2RuRoyGv8DdqwbFpmPG2idjJ28b1gln37hxuYdKNtp6yfjDRVrA9fFxtmE3TvcSVitf2pRSjyRV5z3rRgms2vq94jjC-kQ2PxD30vp1HGkjxH40I1PIr9LqVGduQB9XfXfte-g5fjQq_4USGnMsma2LUTdUwcg4cKQO1ag0sJ3VkWr8L_M9Wf0njCV20NkbBeP2Ch8THpTTzLz7yu7JfPt0y29OLLDM9cds22jF2CUodiiHNNw",
                "tokenType": "Bearer",
                "scope": "naji_api_scope",
                "createdAt": 1690798357430,
                "expiresIn": 3600000
            }
        }

    }
    next()
})

// const options = yaml.load(fs.readFileSync('./swagger.yaml', 'utf8'));

// const swaggerSpec = swaggerJSDoc({
//     definition: {
//         openapi: "3.0.0",
//         info: {
//             title: 'REST API Docs',
//             version: '1.0.0'
//         }
//     }, apis: ['./routes/*.ts', './models/*.ts']
// });

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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