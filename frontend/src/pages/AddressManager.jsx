import { useState, useEffect, useContext, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import tt from "@tomtom-international/web-sdk-maps"; // Import TomTom Maps SDK
import "@tomtom-international/web-sdk-maps/dist/maps.css"; // Import CSS của TomTom Maps

const AddressManager = () => {
  const { token, backend_url } = useContext(ShopContext);
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
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Quản lý địa chỉ</h2>

      <form
        onSubmit={handleAddressSubmit}
        className="bg-white p-6 rounded shadow-md space-y-4"
      >
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={onChangeHandler}
          placeholder="Họ"
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={onChangeHandler}
          placeholder="Tên"
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={onChangeHandler}
          placeholder="Số điện thoại"
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        <div ref={mapElement} style={{ height: "300px", width: "100%" }} className="rounded border"></div>
        <p className="text-gray-600 mt-2">Địa chỉ: {searchInput}</p>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {editingAddressId ? "Cập nhật" : "Thêm"}
        </button>
      </form>

      <h3 className="text-xl font-semibold mt-6">Danh sách địa chỉ</h3>
      {addresses.length === 0 ? (
        <p className="text-gray-500">Không có địa chỉ nào.</p>
      ) : (
        <ul className="space-y-4 mt-4">
          {addresses.map((address) => (
            <li
              key={address._id}
              className="bg-white p-4 rounded shadow-md flex justify-between items-center"
            >
              <p>
                {address.firstName} {address.lastName} - {address.street},{" "}
                {address.city}, {address.state}, {address.zipcode}
              </p>
              <div className="space-x-2">
                <button
                  onClick={() => handleEditAddress(address)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDeleteAddress(address._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressManager;
