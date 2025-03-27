import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  birth: { type: Date, required: true },
  image: { type: String, default: 'https://via.placeholder.com/150' },
  cartData: { type: Object, default: {} },
}, { minimize: false });

const User = mongoose.models.User || mongoose.model('User', userSchema);  // Đảm bảo đã đăng ký đúng tên

export default User;
