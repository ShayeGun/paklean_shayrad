import express from 'express';
import cookieParser from "cookie-parser";
import helmet from 'helmet';
import cors from 'cors';

import { userRoute } from './routes/user-router';
import { errorHandler } from './utils/error-handler';
import { RouteError } from './utils/errors/route-error';
import { catchAsync } from './utils/catch-async';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
    helmet({
        hsts: {
            maxAge: 31536000,
        },
        contentSecurityPolicy: {
            useDefaults: false,
            directives: {
                "default-src": ["'none'"],
                "frame-ancestors": ["'none'"],
            },
        },
        frameguard: {
            action: "deny",
        },
    })
);

app.use(
    cors({
        methods: ["GET"],
        allowedHeaders: ["Authorization", "Content-Type", "Cookie"],
        maxAge: 86400,
    })
);

app.route('/hello')
    .all(async (req, res) => {
        res.send('hello baby 😉')
    })
app.use('/user', userRoute);
app.use('*', (req, res, next) => {
    next(new RouteError('No Such URL Sry 🥲'))
})

app.use(errorHandler)

export { app }