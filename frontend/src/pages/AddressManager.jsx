import { useState, useEffect, useContext, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import tt from "@tomtom-international/web-sdk-maps"; // Import TomTom Maps SDK
import "@tomtom-international/web-sdk-maps/dist/maps.css"; // Import CSS của TomTom Maps

const AddressManager = () => {
  const { token, backend_url, navigate } = useContext(ShopContext);
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
  });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 21.0285, lon: 105.8542 }); // Default to Hanoi
  const [searchInput, setSearchInput] = useState("");
  const mapElement = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const [activeTab, setActiveTab] = useState("edit-user"); // Quản lý tab hiện tại

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
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
      });
      setEditingAddressId(null);
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi lưu địa chỉ.");
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address._id);
    setFormData({
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      zipcode: address.zipcode,
      country: address.country,
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
    } catch (error) {
      toast.error("Không thể xóa địa chỉ.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate("edit-profile")}
              className={`px-4 py-2 text-lg font-medium ${activeTab === "edit-user"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
                } transition-colors`}
            >
              Thông tin cá nhân
            </button>
            <button
              onClick={() => navigate("edit-profile/address")}
              className={`px-4 py-2 text-lg font-medium ${activeTab === "address"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
                } transition-colors`}
            >
              Địa chỉ
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Address Form */}
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingAddressId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}</h2>
          <form onSubmit={handleAddressSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Họ</label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={onChangeHandler}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập họ của bạn"
                  required
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Tên</label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={onChangeHandler}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập tên của bạn"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={onChangeHandler}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>
            </div>

            {/* Map */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Chọn vị trí trên bản đồ</label>
              <div
                ref={mapElement}
                className="h-72 w-full rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm"
              />
              <p className="text-sm text-gray-600 mt-2">Địa chỉ: {searchInput || "Vui lòng chọn vị trí trên bản đồ"}</p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
              >
                {editingAddressId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
              </button>
            </div>
          </form>
        </div>

        {/* Address List */}
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Danh sách địa chỉ</h3>
          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Chưa có địa chỉ nào được lưu</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    {/* Address Info */}
                    <div className="mb-2 md:mb-0">
                      <p className="font-medium">{address.firstName} {address.lastName}</p>
                      <p className="text-gray-600 text-sm">{address.street}</p>
                      <p className="text-gray-600 text-sm">
                        {address.city}, {address.state}, {address.zipcode}
                      </p>
                      <p className="text-gray-600 text-sm">{address.phone}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-2 md:mt-0">
                      <button
                        onClick={() => handleEditAddress(address)}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors text-sm"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address._id)}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressManager;
