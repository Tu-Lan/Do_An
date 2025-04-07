import express from 'express';
import cors from 'cors';
import "dotenv/config";
import connectDB from './config/db.js';
import cloudinary from './config/cloudinary.js'; 
import cron from 'node-cron'; 
import importModel from './models/importModel.js'; 
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import categoryRouter from './routes/categoryRoute.js';
import translationRouter from './routes/translateRoute.js';
import stockRouter from './routes/stockRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import importRouter from './routes/importRoute.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

const startServer = async () => {
  await connectDB();

  app.use('/api/user', userRouter);
  app.use('/api/product', productRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/order', orderRouter);
  app.use('/api/category', categoryRouter);
  app.use('/api/stock', stockRouter);
  app.use('/api/translation', translationRouter);
  app.use('/api/review', reviewRouter);
  app.use('/api/import', importRouter);

  app.get('/', (req, res) => {
    res.send("API successfully connected!");
  });

  cron.schedule('0 0 * * *', async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await importModel.deleteMany({
        isDeleted: true,
        deletedAt: { $lte: thirtyDaysAgo },
      });

      console.log(`Đã xóa hẳn ${result.deletedCount} phiếu nhập từ thùng rác.`);
    } catch (error) {
      console.error("Lỗi khi xóa hẳn phiếu nhập:", error);
    }
  });

  app.listen(port, () => {
    console.log('Server is running on port:', port);
  });
};

startServer();