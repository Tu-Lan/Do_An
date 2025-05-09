import express from 'express';
import {
  getAllUsers,
  handleAdminLogin,
  handleUserLogin,
  handleUserRegister,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  getUserById,
  adminUpdateUser,
  deleteUser,
  addAddress,
  updateAddress,
  getAddresses,
  removeAddress,
  getUserStats,
  getRegisteredUsers,
  setDefaultAddress
} from '../controllers/userController.js';

import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import upload from '../middleware/multer.js';

const userRouter = express.Router();

userRouter.post('/register', upload.single('image'), handleUserRegister);

userRouter.post('/login', handleUserLogin);

userRouter.post('/admin', handleAdminLogin);

userRouter.get('/list', adminAuth, getAllUsers);

userRouter.delete('/delete/:id', adminAuth, deleteUser);

userRouter.get('/get/:id', authUser, getUserById);

userRouter.get('/profile', authUser,  getCurrentUserProfile);

userRouter.put('/profile', authUser, upload.single('image'), updateCurrentUserProfile);

userRouter.put('/update/:id', adminAuth,upload.single('image'), adminUpdateUser);
userRouter.get("/addresses", authUser, getAddresses);

userRouter.post("/address", authUser, addAddress);

userRouter.put("/address/:addressId", authUser, updateAddress);
userRouter.put('/address/default/:addressId', authUser, setDefaultAddress);

userRouter.delete("/address/:addressId", authUser, removeAddress);

userRouter.get("/stats", adminAuth, getUserStats);
userRouter.get('/registered-users', adminAuth, getRegisteredUsers);

export default userRouter;