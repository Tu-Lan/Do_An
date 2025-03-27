// backend/middleware/multer.js

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Đảm bảo thư mục 'uploads' tồn tại
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'uploads/'); // Thư mục lưu trữ tạm
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + '-' + file.originalname); // Đặt tên file với timestamp
  }
});

const upload = multer({ storage });

export default upload;