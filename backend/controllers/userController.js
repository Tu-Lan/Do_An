// backend/controllers/userController.js

import userModel from "../models/userModel.js";
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import upload from "../middleware/multer.js";

// Hàm tạo token
const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Đăng nhập người dùng
const handleUserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra dữ liệu
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email và mật khẩu là bắt buộc" });
    }

    // Tìm user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Sai mật khẩu" });
    }

    // Trả về token
    const token = createToken(user._id, 'user');
    res.status(200).json({ success: true, token, userId: user._id });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Đăng ký người dùng
const handleUserRegister = async (req, res) => {
  try {
    const { name, email, password, gender, birth } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !email || !password || !gender || !birth) {
      return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin." });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Mật khẩu phải có ít nhất 8 ký tự." });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email đã tồn tại." });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo người dùng mới
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      gender,
      birth,
    });

    const token = createToken(newUser._id);
    res.status(201).json({ success: true, token, userId: newUser._id });
  } catch (error) {
    console.error("Lỗi khi đăng ký người dùng:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};

// Đăng nhập admin
const handleAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email và mật khẩu là bắt buộc" });
    }

    // Check admin credentials
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS) {
      const token = createToken(email, 'admin');
      res.status(200).json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: "Thông tin đăng nhập sai!!" });
    }
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Lấy tất cả người dùng (chỉ admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select('-password');
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Lấy người dùng theo ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Lấy thông tin người dùng hiện tại
const getCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng hiện tại:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

// Cập nhật thông tin người dùng hiện tại
// const updateCurrentUserProfile = async (req, res) => {
//   try {
//     const userId = req.user.id; // Lấy từ middleware auth
//     const { name, email, password } = req.body;

//     // Tìm người dùng
//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // Cập nhật các trường nếu có
//     if (name) user.name = name;
//     if (email) {
//       // Kiểm tra email đã tồn tại chưa
//       const existingUser = await userModel.findOne({ email });
//       if (existingUser && existingUser._id.toString() !== userId) {
//         return res.status(409).json({ success: false, message: "Email already in use" });
//       }
//       user.email = email;
//     }
//     if (password) {
//       // Mã hóa mật khẩu mới
//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(password, salt);
//     }

//     // Lưu thay đổi
//     await user.save();

//     res.status(200).json({ success: true, message: "Profile updated successfully", user });
//   } catch (error) {
//     console.error("Error updating user profile:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };
const updateCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, oldPassword, newPassword, gender, birth } = req.body;
    let imageUrl = null;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
    }

    // Nếu có mật khẩu mới, kiểm tra mật khẩu cũ
    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({ success: false, message: "Cần nhập mật khẩu cũ để đổi mật khẩu." });
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Mật khẩu cũ không chính xác." });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Xử lý upload ảnh
    if (req.file) {
      try {
        const uploadResult = await cloudinary.v2.uploader.upload(req.file.path, { resource_type: "image" });
        imageUrl = uploadResult.secure_url;
        user.image = imageUrl;
      } catch (error) {
        return res.status(500).json({ success: false, message: "Upload ảnh thất bại.", error: error.message });
      }
    }

    // Cập nhật thông tin khác
    if (name) user.name = name;
    if (email) {
      const existingUser = await userModel.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(409).json({ success: false, message: "Email đã được sử dụng." });
      }
      user.email = email;
    }
    if (gender) user.gender = gender;
    if (birth) user.birth = birth;

    const updatedUser = await user.save();
    res.status(200).json({ success: true, message: "Cập nhật hồ sơ thành công.", user: updatedUser });
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin người dùng:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
    }

    await userModel.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Người dùng đã được xóa thành công!" });
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    res.status(500).json({ success: false, message: "Đã xảy ra lỗi khi xóa người dùng!" });
  }
};
const adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, gender, birth } = req.body;
    let imageUrl = null;

    // Tìm người dùng
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
    }

    // Xử lý thay đổi mật khẩu nếu có yêu cầu
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Xử lý upload ảnh mới nếu có
    if (req.file) {
      try {
        const uploadResult = await cloudinary.v2.uploader.upload(req.file.path, {
          resource_type: 'image',
        });
        imageUrl = uploadResult.secure_url;
        user.image = imageUrl;
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Upload hình ảnh thất bại.",
          error: error.message,
        });
      }
    }

    // Cập nhật các trường khác (name, email)
    if (name) user.name = name;
    if (email) {
      const existingUser = await userModel.findOne({ email });
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(409).json({ success: false, message: "Email đã được sử dụng." });
      }
      user.email = email;
    }
    if (gender) user.gender = gender;
    if (birth) user.birth = birth;
    const updatedUser = await user.save();
    res.status(200).json({ success: true, message: "Cập nhật thông tin người dùng thành công.", user: updatedUser });
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin người dùng:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
};



export { adminUpdateUser, deleteUser, handleAdminLogin, handleUserRegister, handleUserLogin, getAllUsers, getUserById, getCurrentUserProfile, updateCurrentUserProfile };