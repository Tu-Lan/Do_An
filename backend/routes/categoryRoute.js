// backend/routes/categoryRoute.js

import express from 'express';
import { createCategory, getCategories, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const categoryRouter = express.Router();

categoryRouter.post('/create', adminAuth, upload.single('image'), createCategory);
categoryRouter.get('/list', getCategories); // Route hiện có để lấy danh sách categories
categoryRouter.put('/update/:id', adminAuth, upload.single('image'), updateCategory); // Route cập nhật
categoryRouter.delete('/delete/:id', adminAuth, deleteCategory); // Route xóa

export default categoryRouter;