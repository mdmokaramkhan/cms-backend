import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';

dotenv.config();
await connectDB();

const app = express();

app.use(cors());
app.use(express.json( { limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10m' }));
app.use(morgan('dev'));

app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'CMS Backend is running' });
});

export default app;
