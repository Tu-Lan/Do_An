// backend/server.js

import express from 'express';
import cors from 'cors';
import "dotenv/config";
import connectDB from './config/db.js';
import cloudinary from './config/cloudinary.js'; // Import cloudinary đã được cấu hình
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import categoryRouter from './routes/categoryRoute.js';
import translationRouter from './routes/translateRoute.js';
import stockRouter from './routes/stockRoute.js';
import reviewRouter from './routes/reviewRoute.js';

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());

// Kết nối đến DB
const startServer = async () => {
  await connectDB();
  // Không cần gọi connectCloudinary nữa vì đã cấu hình khi import

  // API Endpoints
  app.use('/api/user', userRouter);
  app.use('/api/product', productRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/order', orderRouter);
  app.use('/api/category', categoryRouter);
  app.use('/api/stock', stockRouter);
  app.use('/api/translation', translationRouter);
  app.use('/api/review', reviewRouter);
  
  app.get('/', (req, res) => {
    res.send("API successfully connected!");
  });

  app.listen(port, () => {
    console.log('Server is running on port:', port);
  });
};

startServer();