import { useState, useEffect, useContext, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import tt from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css";

// EditUser Component
const EditUser = () => {
  const { token, userProfile, fetchUserProfile, updateUserProfile } = useContext(ShopContext);
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
      reader.onloadend = () => setPreviewImage(reader.result);
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
    <div className="bg-white rounded-xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Chỉnh Sửa Hồ Sơ</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Tên</label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Nhập tên của bạn..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            placeholder="Nhập email của bạn..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Giới tính</label>
          <select
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
          <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
          <input
            onChange={(e) => setBirth(e.target.value)}
            value={birth}
            type="date"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Mật Khẩu Cũ</label>
          <input
            onChange={(e) => setOldPassword(e.target.value)}
            value={oldPassword}
            type="password"
            placeholder="Nhập mật khẩu cũ..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Mật Khẩu Mới</label>
          <input
            onChange={(e) => setNewPassword(e.target.value)}
            value={newPassword}
            type="password"
            placeholder="Nhập mật khẩu mới (tùy chọn)..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Chọn Ảnh</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors duration-200"
          />
        </div>
        {previewImage && (
          <div className="flex justify-center mb-6">
            <img src={previewImage} alt="Preview" className="w-32 h-32 object-cover rounded-full border-4 border-gray-200 shadow-md" />
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-medium text-lg"
        >
          Cập Nhật Hồ Sơ
        </button>
      </form>
    </div>
  );
};

// AddressManager Component
const AddressManager = () => {
  const { token, backend_url } = useContext(ShopContext);

  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", phone: "", street: "", city: "", state: "", zipcode: "", country: "",
  });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 21.0285, lon: 105.8542 });
  // const [mapCenter] = useState({ lat: 21.0285, lon: 105.8542 });
  const [suggestions, setSuggestions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const mapElement = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const TOMTOM_API_KEY = import.meta.env.VITE_TOMTOM_API_KEY;

  useEffect(() => {
    const fetchAddresses = async () => {
      const res = await axios.get(`${backend_url}/api/user/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(res.data.addresses);
    };
    fetchAddresses();
  }, [token, backend_url]);

  useEffect(() => {
    if (mapElement.current && !mapInstance.current) {
      mapInstance.current = tt.map({
        key: TOMTOM_API_KEY,
        container: mapElement.current,
        center: [mapCenter.lon, mapCenter.lat],
        zoom: 13,
      });
      markerRef.current = new tt.Marker().setLngLat([mapCenter.lon, mapCenter.lat]).addTo(mapInstance.current);
      mapInstance.current.on("moveend", async () => {
        const { lng, lat } = mapInstance.current.getCenter();
        markerRef.current.setLngLat([lng, lat]);
        try {
          const response = await axios.get(
            `https://api.tomtom.com/search/2/reverseGeocode/${lat},${lng}.json?key=${TOMTOM_API_KEY}`
          );
          if (response.data.addresses.length > 0) {
            const address = response.data.addresses[0].address;
            setFormData((prev) => ({
              ...prev,
              street: address.freeformAddress || "",
              city: address.municipality || "",
              state: address.countrySubdivision || "",
              zipcode: address.postalCode || "",
              country: address.country || "",
            }));
            setSearchInput(address.freeformAddress || "");
          }
        } catch (error) {
          console.error("Error fetching address from coordinates:", error);
        }
      });
    }
  }, [TOMTOM_API_KEY]);
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchInput(query);
    if (query.length > 2) {
      const response = await axios.get(`https://api.tomtom.com/search/2/search/${query}.json?key=${TOMTOM_API_KEY}`);
      setSuggestions(response.data.results.map(res => ({
        address: res.address.freeformAddress,
        position: res.position
      })));
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setSearchInput(suggestion.address);
    setMapCenter({ lat: suggestion.position.lat, lon: suggestion.position.lon });
    mapInstance.current.setCenter([suggestion.position.lon, suggestion.position.lat]);
    markerRef.current.setLngLat([suggestion.position.lon, suggestion.position.lat]);
    setSuggestions([]);
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      toast.error("Bạn cần đăng nhập để thực hiện thao tác này.");
      return;
    }
    try {
      const url = editingAddressId
        ? `${backend_url}/api/user/address/${editingAddressId}`
        : `${backend_url}/api/user/address`;
      const method = editingAddressId ? "put" : "post";
      const response = await axios({
        method,
        url,
        data: formData,
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(editingAddressId ? "Cập nhật địa chỉ thành công!" : "Thêm địa chỉ thành công!");
      setAddresses(response.data.addresses);
      setFormData({ firstName: "", lastName: "", phone: "", street: "", city: "", state: "", zipcode: "", country: "" });
      setEditingAddressId(null);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi lưu địa chỉ.");
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address._id);
    setFormData({
      firstName: address.firstName, lastName: address.lastName, phone: address.phone,
      street: address.street, city: address.city, state: address.state,
      zipcode: address.zipcode, country: address.country,
    });
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await axios.delete(
        `${backend_url}/api/user/address/${addressId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Địa chỉ đã được xóa.");
      setAddresses(response.data.addresses);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Không thể xóa địa chỉ.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Quản Lý Địa Chỉ</h2>
      <form onSubmit={handleAddressSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Họ</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={onChangeHandler}
              placeholder="Nhập họ..."
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tên</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={onChangeHandler}
              placeholder="Nhập tên..."
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onChangeHandler}
            placeholder="Nhập số điện thoại..."
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
          />
        </div>
        <div className="space-y-2 relative"> {/* Thêm relative để làm tham chiếu cho absolute */}
          <label className="block text-sm font-medium text-gray-700">Tìm kiếm địa chỉ</label>
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm địa chỉ..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
          />
          {suggestions.length > 0 && (
            <ul className="absolute w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto z-10"> {/* Thêm z-index */}
              {suggestions.map((sug, index) => (
                <li
                  key={index}
                  onClick={() => handleSelectSuggestion(sug)}
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                >
                  {sug.address}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Bản đồ</label>
          <div ref={mapElement} className="h-80 w-full rounded-lg border border-gray-300 shadow-md"></div>
          <p className="text-gray-600 text-sm mt-2">Địa chỉ: {searchInput || "Di chuyển bản đồ để chọn địa chỉ"}</p>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-medium text-lg"
        >
          {editingAddressId ? "Cập Nhật Địa Chỉ" : "Thêm Địa Chỉ"}
        </button>
      </form>
      <div className="mt-12">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Danh Sách Địa Chỉ</h3>
        {addresses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Không có địa chỉ nào được lưu.</p>
        ) : (
          <ul className="space-y-4">
            {addresses.map((address) => (
              <li key={address._id} className="bg-gray-50 rounded-lg shadow-md p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-gray-700">
                  <span className="font-medium">{address.firstName} {address.lastName}</span> -
                  {address.street}, {address.city}, {address.state}, {address.zipcode}, {address.country}
                </p>
                <div className="flex space-x-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="flex-1 sm:flex-none bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 focus:ring-4 focus:ring-yellow-200 transition-all duration-200"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address._id)}
                    className="flex-1 sm:flex-none bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:ring-4 focus:ring-red-200 transition-all duration-200"
                  >
                    Xóa
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// Main Profile Component
const UserSettings = () => {
  const { token, userProfile, fetchUserProfile, updateUserProfile, backend_url, navigate } = useContext(ShopContext);
  const [activeTab, setActiveTab] = useState("edit-user");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header (giả sử đây là header của trang) */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Nội dung header nếu có */}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex justify-center space-x-8 bg-white shadow-md rounded-lg p-4">
          <button
            onClick={() => setActiveTab("edit-user")}
            className={`text-lg font-medium py-2 px-4 rounded-lg transition-all duration-200 ${activeTab === "edit-user"
                ? "bg-blue-600 text-white"
                : "text-gray-900 hover:bg-gray-100"
              }`}
          >
            Thông tin người dùng
          </button>
          <button
            onClick={() => setActiveTab("address")}
            className={`text-lg font-medium py-2 px-4 rounded-lg transition-all duration-200 ${activeTab === "address"
                ? "bg-blue-600 text-white"
                : "text-gray-900 hover:bg-gray-100"
              }`}
          >
            Địa chỉ giao hàng
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-4xl">
          {activeTab === "edit-user" ? (
            <EditUser
              token={token}
              userProfile={userProfile}
              fetchUserProfile={fetchUserProfile}
              updateUserProfile={updateUserProfile}
              navigate={navigate}
            />
          ) : (
            <AddressManager token={token} backend_url={backend_url} />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSettings;