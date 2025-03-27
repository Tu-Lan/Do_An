import express from 'express';
import { addProductForSale, addToStock, createProduct, deleteProduct, deleteStockItem, getAllProduct, getProductById, getSaleProductList, getStockList, updateProduct, updateStockItem} from '../controllers/productController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const productRouter = express.Router();

productRouter.post('/create', adminAuth, upload.single('image'), createProduct);
productRouter.put('/update/:id', upload.single('image'), updateProduct);
productRouter.post('/stock/add', adminAuth, upload.single('image'), addToStock);
productRouter.post('/sale/add', adminAuth, upload.single('image'), addProductForSale);
productRouter.put('/stock/update/:id', adminAuth, updateStockItem);
productRouter.get('/stock/list', adminAuth, getStockList);
productRouter.delete('/stock/delete', adminAuth, deleteStockItem);
productRouter.get('/sale/list', adminAuth, getSaleProductList);
productRouter.delete('/delete', adminAuth, deleteProduct);
productRouter.post('/single', getProductById);
productRouter.get('/list', getAllProduct);

export default productRouter;