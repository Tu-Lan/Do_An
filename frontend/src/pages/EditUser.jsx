import { useState, useEffect, useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import Footer from "../components/Footer";

const EditUser = () => {
  const { token, userProfile, fetchUserProfile, updateUserProfile, navigate } = useContext(ShopContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [gender, setGender] = useState("Male");
  const [birth, setBirth] = useState("");
  const [isProfileFetched, setIsProfileFetched] = useState(false);

  useEffect(() => {
    if (token && !isProfileFetched) {
      fetchUserProfile();
      setIsProfileFetched(true);
    }
  }, [token, fetchUserProfile, isProfileFetched]);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setEmail(userProfile.email);
      setGender(userProfile.gender || "Male");
      setBirth(userProfile.birth ? userProfile.birth.split("T")[0] : "");
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
    if (newPassword && !oldPassword) {
      toast.error("Vui lòng nhập mật khẩu cũ để thay đổi mật khẩu mới!");
      return;
    }
    await updateUserProfile(name, email, oldPassword, newPassword, image, gender, birth);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <button
            onClick={() => navigate("edit-profile")}
            className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200"
          >
            Edit User
          </button>
          <button
            onClick={() => navigate("edit-profile/address")}
            className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200"
          >
            Address
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-12">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Chỉnh Sửa Hồ Sơ</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên</label>
              <input
                id="name"
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="Nhập tên của bạn..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Nhập email của bạn..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Giới tính</label>
              <select
                id="gender"
                onChange={(e) => setGender(e.target.value)}
                value={gender}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                required
              >
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="birth" className="block text-sm font-medium text-gray-700">Ngày sinh</label>
              <input
                id="birth"
                onChange={(e) => setBirth(e.target.value)}
                value={birth}
                type="date"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">Mật Khẩu Cũ</label>
              <input
                id="oldPassword"
                onChange={(e) => setOldPassword(e.target.value)}
                value={oldPassword}
                type="password"
                placeholder="Nhập mật khẩu cũ..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Mật Khẩu Mới</label>
              <input
                id="newPassword"
                onChange={(e) => setNewPassword(e.target.value)}
                value={newPassword}
                type="password"
                placeholder="Nhập mật khẩu mới (tùy chọn)..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">Chọn Ảnh</label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors duration-200"
              />
            </div>

            {previewImage && (
              <div className="flex justify-center mb-6">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-full border-4 border-gray-200 shadow-md"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-medium text-lg"
            >
              Cập Nhật Hồ Sơ
            </button>
          </form>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default EditUser;