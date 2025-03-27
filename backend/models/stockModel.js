import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  name: { type: String, required: true },
  author: { type: String, required: true },
  publisher: { type: String, required: true }, // Thêm trường publisher
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }, // Số lượng hiện có trong kho
});

const stockModel = mongoose.models.stock || mongoose.model('stock', stockSchema);

export default stockModel;
