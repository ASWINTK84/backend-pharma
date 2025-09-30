import dotenv from 'dotenv';

dotenv.config();


import express from 'express';
import mongoose from 'mongoose';

import cors from 'cors';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import adminRoutes from './routes/admin.js';
import shareRoutes from './routes/share.js';



const app = express();
app.use(cors({
  origin: 'https://frontend-pharma.vercel.app', 
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/share', shareRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Mongo connected');
    app.listen(PORT, () => console.log('Server running on ' + PORT));
  }).catch(err => {
    console.error('DB error', err);
  });
