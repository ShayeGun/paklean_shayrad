import express from 'express';
import cookieParser from "cookie-parser";
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit'
import ExpressMongoSanitize from 'express-mongo-sanitize';
import { userRoute } from './routes/user-router';
import { errorHandler } from './controllers/error-handler';
import { CustomError } from './utils/custom-error';
import { catchAsync } from './utils/catch-async';

const app = express();
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

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

app.route('/api/v1/hello')
    .all(async (req, res) => {
        res.send('hello baby 😉')
    })
app.use('/api/v1/user', userRoute);
app.use('*', (req, res, next) => {
    next(new CustomError('No Such URL Sry 🥲', 404, 404))
})

app.use(errorHandler)

export { app }