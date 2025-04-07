import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import { deleteImport, getImportList, permanentlyDeleteImport, restoreImport, updateImport } from '../controllers/importController.js';
import upload from '../middleware/multer.js';

const importRouter = express.Router();

importRouter.get('/list', adminAuth, getImportList);
importRouter.put('/:id', adminAuth, upload.single('image') , updateImport);
importRouter.delete('/:id', adminAuth, deleteImport);
importRouter.post('/restore/:id',adminAuth, restoreImport); 
importRouter.delete('/permanent/:id',adminAuth, permanentlyDeleteImport);

export default importRouter;