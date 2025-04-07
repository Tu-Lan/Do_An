import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  birth: { type: Date, required: true },
  image: { type: String, default: 'https://via.placeholder.com/150' },
  cartData: { type: Object, default: {} },
  addresses: [{ 
    firstName: String,
    lastName: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
    phone: String,
  }],
}, { minimize: false });


const User = mongoose.models.User || mongoose.model('User', userSchema);  

export default User;
