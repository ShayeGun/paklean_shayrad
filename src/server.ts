import { app } from './app'
import env from 'dotenv'
import mongoose from "mongoose"

env.config({ path: `${__dirname}/.env` });

mongoose.connect('mongodb://shy-mongo:27017/police').then(() => {
    console.log('MongoDB connected');
}).catch((err) => {
    console.error('MongoDB connection error', err);
});

app.listen(process.env.PORT, () => {
    console.log(`listening on port ${process.env.PORT} ...`);
})