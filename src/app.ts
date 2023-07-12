import express from 'express';
import { authRoute } from './routes/authentication';
import { errorHandler } from './utils/error-handler';
import { RouteError } from './errors/route-error';
import { catchAsync } from './utils/catch-async';

const app = express();
app.use(express.json());

app.use('/auth', authRoute);
app.use('*', (req, res, next) => {
    next(new RouteError('No Such URL Sry 🥲'))
})

app.use(errorHandler)

export { app }