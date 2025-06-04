# Hệ Thống Bán Sách Online - Nhà Sách Tri Thức


## 📚 Giới thiệu dự án
Hệ thống bán sách online cho **Nhà Sách Tri Thức** là giải pháp thương mại điện tử toàn diện, cho phép khách hàng mua sách trực tuyến và quản lý hiệu quả hoạt động kinh doanh sách. Dự án được phát triển như đồ án tốt nghiệp Đại học chuyên ngành Công nghệ Phần mềm tại **Trường Đại học Mở Hà Nội**.

Here's the revised "Công nghệ sử dụng" section with icons:

Here's the revised "Công nghệ sử dụng" section with icons:

## 🛠 Công nghệ sử dụng

### 🌐 Frontend
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="20" height="20"/> **ReactJS** - Thư viện JavaScript xây dựng giao diện
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg" width="20" height="20"/> **Redux** - Quản lý state
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg" width="20" height="20"/> **Tailwind CSS** - Framework CSS
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/axios/axios-original.svg" width="20" height="20"/> **Axios** - Xử lý HTTP requests
- <img src="https://reactrouter.com/favicon.ico" width="20" height="20"/> **React Router** - Điều hướng ứng dụng

### ⚙️ Backend
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="20" height="20"/> **Node.js** - Môi trường thực thi
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" width="20" height="20"/> **Express.js** - Framework API
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" width="20" height="20"/> **MongoDB** - Cơ sở dữ liệu
- <img src="https://mongoosejs.com/docs/images/favicon.ico" width="20" height="20"/> **Mongoose** - ODM cho MongoDB
- <img src="https://jwt.io/img/favicon.ico" width="20" height="20"/> **JWT** - Xác thực người dùng
- <img src="https://github.com/expressjs/multer/blob/master/logo.png?raw=true" width="20" height="20"/> **Multer** - Xử lý upload file

### 🛡️ Bảo mật
- <img src="https://stripe.com/favicon.ico" width="20" height="20"/> **Stripe** - Thanh toán an toàn
- <img src="https://www.cloudinary.com/favicon.ico" width="20" height="20"/> **Cloudinary** - Lưu trữ hình ảnh

### 🚀 Tiện ích
- <img src="https://git-scm.com/favicon.ico" width="20" height="20"/> **Git** - Quản lý phiên bản
- <img src="https://nodemon.io/favicon.ico" width="20" height="20"/> **Nodemon** - Tự động reload server

## ⚙️ Các chức năng chính

### 👨‍💼 Cho khách hàng
- ✅ Đăng ký/Đăng nhập tài khoản
- ✅ Tìm kiếm sách theo nhiều tiêu chí
- ✅ Xem chi tiết sản phẩm (thông tin, đánh giá)
- ✅ Quản lý giỏ hàng
- ✅ Đặt hàng và thanh toán
- ✅ Theo dõi trạng thái đơn hàng
- ✅ Đánh giá sản phẩm đã mua
- ✅ Quản lý hồ sơ cá nhân
- ✅ Quản lý địa chỉ giao hàng

### 👑 Cho quản trị viên
- ✅ Quản lý tài khoản người dùng
- ✅ Quản lý danh mục sản phẩm
- ✅ Quản lý kho sách (thêm/xóa/sửa sản phẩm)
- ✅ Quản lý đơn hàng (cập nhật trạng thái, hủy đơn)
- ✅ Tạo phiếu nhập hàng
- ✅ Thống kê doanh thu
- ✅ Xem báo cáo sản phẩm bán chạy
- ✅ Quản lý đánh giá của khách hàng

## 🚀 Cài đặt dự án

### Yêu cầu hệ thống
- Node.js (v14.x trở lên)
- MongoDB (v4.4 trở lên)
- Git

### Các bước cài đặt

1. **Clone repository**
```bash
git clone https://github.com/Tu-Lan/Do_An.git
cd Do_An
```

2. **Cài đặt backend**
```bash
cd backend
npm install
```

3. **Cấu hình môi trường**  
Tạo file `.env` trong thư mục backend với nội dung:
```env
PORT = 4000
JWT_SECRET =
JWT_REFRESH_SECRET =
MONGO_URI = 

CLDN_NAME =
CLDN_API_KEY = 
CLDN_API_SECRET =

# admin account
ADMIN_EMAIL =
ADMIN_PASS = 

#api stripe payment
STRIPE_SECRET_KEY = 
```

4. **Cài đặt frontend**
```bash
cd ../frontend
npm install
```
```bash
cd ../admin
npm install
```
```bash
cd ../backend
npm install
```

5. **Khởi chạy ứng dụng**
```bash
# Terminal 1 (backend)
cd backend
nodemon index.js
```bash
# Terminal 2 (frontend)
cd frontend
npm start
```
```bash
# Terminal 3 (admin)
cd admin
npm start
```

6. **Truy cập ứng dụng**
- Frontend: http://localhost:5173
- Admin: http://localhost:5174
- Backend: http://localhost:5000

## 📖 Hướng dẫn sử dụng

### Tài khoản demo
**Khách hàng:**
- Email: customer@example.com
- Mật khẩu: 123456

**Quản trị viên:**
- Email: luuphuongvy0209@gmail.com
- Mật khẩu: Quyet2002@

### Cấu trúc thư mục
```
Do_An/
├── backend/          # Mã nguồn server
│   ├── controllers/  # Xử lý logic nghiệp vụ
│   ├── models/       # Định nghĩa MongoDB models
│   ├── routes/       # Định tuyến API
│   ├── utils/        # Tiện ích hỗ trợ
│   └── server.js     # Điểm khởi chạy server
│
├── frontend/         # Ứng dụng React
│   ├── public/       # Tài nguyên tĩnh
│   ├── src/          # Mã nguồn chính
│   │   ├── assets/   # Hình ảnh, font chữ
│   │   ├── components/ # Component tái sử dụng
│   │   ├── pages/    # Các trang chính
│   │   ├── redux/    # Quản lý state
│   │   ├── services/ # Kết nối API
│   │   └── App.js    # Component gốc
│   └── package.json
│
├── admin/         # Ứng dụng React
│   ├── public/       # Tài nguyên tĩnh
│   ├── src/          # Mã nguồn chính
│   │   ├── assets/   # Hình ảnh, font chữ
│   │   ├── components/ # Component tái sử dụng
│   │   ├── pages/    # Các trang chính
│   │   ├── redux/    # Quản lý state
│   │   ├── services/ # Kết nối API
│   │   └── App.js    # Component gốc
│   └── package.json
├── documents/        # Tài liệu dự án
└── README.md         # Hướng dẫn này
```


## 👤 Tác giả
- **Lưu Đắc Quyết** - Nhà phát triển chính
- MSSV: 20A10010232
- Lớp: 2010A01
- Trường Đại học Mở Hà Nội

## 👩‍🏫 Giảng viên hướng dẫn
- ThS. Trịnh Thị Xuân

## 📜 Giấy phép
Dự án được phát triển phục vụ mục đích học tập và nghiên cứu. Mọi sử dụng cho mục đích thương mại cần có sự cho phép của tác giả.

---

**© 2025 Nhà Sách Tri Thức** |  [Xem mã nguồn](https://github.com/Tu-Lan/Do_An)
