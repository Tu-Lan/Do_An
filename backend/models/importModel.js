import mongoose from 'mongoose';

const importSchema = new mongoose.Schema({
  stockItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true }, 
  name: { type: String, required: true }, 
  author: { type: String, required: true }, 
  publisher: { type: String, required: true }, 
  price: { type: Number, required: true }, 
  quantity: { type: Number, required: true }, 
  image: { type: String }, 
  importDate: { type: Date, default: Date.now }, 
  createdAt: { type: Date, default: Date.now }, 
  isDeleted: { type: Boolean, default: false }, 
  deletedAt: { type: Date, default: null }, 
});

const importModel = mongoose.model('Import', importSchema);
export default importModel;