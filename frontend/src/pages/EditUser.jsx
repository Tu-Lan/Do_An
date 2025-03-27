import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import { useContext, useState, useEffect } from "react";

const EditUser = () => {
  const { navigate, token, userProfile, fetchUserProfile, updateUserProfile } = useContext(ShopContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState(""); // Trường mật khẩu cũ
  const [newPassword, setNewPassword] = useState(""); // Trường mật khẩu mới
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [gender, setGender] = useState("Male"); // Giá trị mặc định
  const [birth, setBirth] = useState("");
  const [isProfileFetched, setIsProfileFetched] = useState(false); // Cờ kiểm tra

  useEffect(() => {
    if (token && !isProfileFetched) {
      fetchUserProfile();
      setIsProfileFetched(true); // Đánh dấu đã gọi API
    }
  }, [token, fetchUserProfile, isProfileFetched]);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setEmail(userProfile.email);
      setGender(userProfile.gender || "Male"); // Giá trị mặc định nếu không có
      setBirth(userProfile.birth ? userProfile.birth.split("T")[0] : ""); // Format ngày
      setPreviewImage(userProfile.image);
    }
  }, [userProfile]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Nếu muốn thay đổi mật khẩu, yêu cầu nhập mật khẩu cũ
    if (newPassword && !oldPassword) {
      toast.error("Vui lòng nhập mật khẩu cũ để thay đổi mật khẩu mới!");
      return;
    }

    await updateUserProfile(name, email, oldPassword, newPassword, image, gender, birth);
  };

  return (
    <div className="flex justify-center p-6">
      <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">Chỉnh Sửa Hồ Sơ</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-6">
          {/* Trường Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-semibold text-gray-700">Tên</label>
            <input
              id="name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              placeholder="Nhập tên của bạn..."
              className="border p-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Trường Email */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</label>
            <input
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Nhập email của bạn..."
              className="border p-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Trường Gender */}
          <div className="flex flex-col gap-2">
            <label htmlFor="gender" className="text-sm font-semibold text-gray-700">Giới tính</label>
            <select
              id="gender"
              onChange={(e) => setGender(e.target.value)}
              value={gender}
              className="border p-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
              <option value="Other">Khác</option>
            </select>
          </div>

          {/* Trường Birth */}
          <div className="flex flex-col gap-2">
            <label htmlFor="birth" className="text-sm font-semibold text-gray-700">Ngày sinh</label>
            <input
              id="birth"
              onChange={(e) => setBirth(e.target.value)}
              value={birth}
              type="date"
              className="border p-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Trường Mật Khẩu Cũ */}
          <div className="flex flex-col gap-2">
            <label htmlFor="oldPassword" className="text-sm font-semibold text-gray-700">Mật Khẩu Cũ</label>
            <input
              id="oldPassword"
              onChange={(e) => setOldPassword(e.target.value)}
              value={oldPassword}
              type="password"
              placeholder="Nhập mật khẩu cũ..."
              className="border p-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Trường Mật Khẩu Mới */}
          <div className="flex flex-col gap-2">
            <label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">Mật Khẩu Mới</label>
            <input
              id="newPassword"
              onChange={(e) => setNewPassword(e.target.value)}
              value={newPassword}
              type="password"
              placeholder="Nhập mật khẩu mới (tùy chọn)..."
              className="border p-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Trường Hình Ảnh */}
          <div className="flex flex-col gap-2">
            <label htmlFor="image" className="text-sm font-semibold text-gray-700">Chọn Ảnh</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="border p-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Hiển Thị Xem Trước Hình Ảnh */}
          {previewImage && (
            <div className="mb-6">
              <img src={previewImage} alt="Preview" className="w-32 h-32 object-cover rounded-full" />
            </div>
          )}

          {/* Nút Submit */}
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out w-full"
          >
            Cập Nhật Hồ Sơ
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
