import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  publisher: { type: String, required: true }, 
  totalQuantity: { type: Number, required: true, default: 0 },
  date: { type: Number, required: true },
  popular: { type: Boolean },
});

const productModel = mongoose.models.product || mongoose.model('product', productSchema);

export default productModel;
