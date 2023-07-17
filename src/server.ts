import { app } from './app'
import env from 'dotenv'
import mongoose from "mongoose"
import { checkEnvVar } from './utils/check-environment-variables';

env.config({ path: `${__dirname}/.env` });

// environment variables check
checkEnvVar('PORT', 'TOKEN_URL', 'GRANT_TYPE', 'SERVER_ADDRESS', 'JWT_SECRET', 'MONGODB_URL', 'JWT_EXPIRES_AT')

mongoose.connect(process.env.MONGODB_URL!).then(() => {
    console.log('Shayrad MongoDB connected');
}).catch((err) => {
    console.error('Shayrad MongoDB connection error', err);
});

const port = process.env.PORT || 7890;

const server = app.listen(port, () => {
    console.log(`listening on port ${port} ...`);
})

process.on('unhandledRejection', (err: Error) => {
    console.log(err.name, err.message);

    server.close(() => {
        console.log('App in shutting down ❌');

        process.exit(1);
    });
});