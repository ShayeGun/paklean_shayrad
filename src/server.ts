import { app } from './app'
import env from 'dotenv'
import mongoose from "mongoose"
import { checkEnvVar } from './utils/check-environment-variables';

env.config({ path: `${__dirname}/.env` });

// environment variables check
checkEnvVar('PORT', 'TOKEN_URL', 'SERVER_ADDRESS', 'JWT_SECRET', 'MONGODB_URL', 'JWT_EXPIRES_AT')

mongoose.connect(process.env.MONGODB_URL!).then(() => {
    console.log('Shayrad MongoDB connected');
}).catch((err) => {
    console.error('Shayrad MongoDB connection error', err);
});

app.listen(process.env.PORT, () => {
    console.log(`listening on port ${process.env.PORT} ...`);
})