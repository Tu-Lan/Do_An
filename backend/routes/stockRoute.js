// backend/routes/stockRoute.js

import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import upload from '../middleware/multer.js';
import { addToStock } from '../controllers/stockController.js';

const stockRouter = express.Router();

stockRouter.post('/stock/add',upload.single('image'),adminAuth, addToStock);

export default stockRouter;