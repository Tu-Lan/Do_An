// backend/routes/categoryRoute.js

import express from 'express';
import { createCategory, getCategories, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const categoryRouter = express.Router();

categoryRouter.post('/create', adminAuth, upload.single('image'), createCategory);
categoryRouter.get('/list', getCategories); 
categoryRouter.put('/update/:id', adminAuth, upload.single('image'), updateCategory); 
categoryRouter.delete('/delete/:id', adminAuth, deleteCategory);

export default categoryRouter;