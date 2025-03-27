import { useState, useEffect, useContext, useRef } from "react";
import CartTotal from "../components/CartTotal";
import Title from "../components/Title";
import Footer from "../components/Footer";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import Select from "react-select";
import tt from "@tomtom-international/web-sdk-maps"; // Import TomTom Maps SDK
import "@tomtom-international/web-sdk-maps/dist/maps.css"; // Import CSS của TomTom Maps

const PlaceOrder = () => {
  const {
    books,
    navigate,
    token,
    getCartAmount,
    cartItems,
    setCartItems,
    backend_url,
    delivery_charges,
  } = useContext(ShopContext);

  const TOMTOM_API_KEY = import.meta.env.VITE_TOMTOM_API_KEY;
  const mapElement = useRef(null); // Ref để giữ bản đồ
  const mapInstance = useRef(null); // Lưu trữ bản đồ TomTom
  const markerRef = useRef(null); // Lưu trữ marker

  const [method, setMethod] = useState("cod"); // Mặc định là COD
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "", // ✅ Thêm trường số điện thoại
  });

  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 21.0285, lon: 105.8542 }); // Mặc định Hà Nội
  const [markerPosition, setMarkerPosition] = useState({ lat: 21.0285, lon: 105.8542 });

  useEffect(() => {
    if (!token) {
      toast.error("Bạn chưa đăng nhập. Vui lòng đăng nhập tài khoản...");
      navigate("/login");
    }
  }, [token, navigate]);

  // ✅ Tạo bản đồ TomTom khi component render
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
        setMarkerPosition({ lon: lng, lat });
        markerRef.current.setLngLat([lng, lat]);
        try {
          const response = await axios.get(
            `https://api.tomtom.com/search/2/reverseGeocode/${lat},${lng}.json?key=${TOMTOM_API_KEY}`
          );
          if (response.data.addresses.length > 0) {
            const newAddress = response.data.addresses[0].address.freeformAddress;
            setSearchInput(newAddress); // Cập nhật ô Select
            setFormData((prev) => ({
              ...prev,
              street: newAddress,
            }));
          }
        } catch (error) {
          console.error("Lỗi khi lấy địa chỉ từ tọa độ:", error);
        }
      });
    }
  }, [TOMTOM_API_KEY]);

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const handleSearch = async (inputValue) => {
    if (!inputValue) return;
    setSearchInput(inputValue);

    try {
      const response = await axios.get(
        `https://api.tomtom.com/search/2/search/${encodeURIComponent(inputValue)}.json?key=${TOMTOM_API_KEY}&limit=5`
      );

      setSearchResults(
        response.data.results.map((place) => ({
          label: place.address.freeformAddress,
          value: place.address.freeformAddress,
          lat: place.position.lat,
          lon: place.position.lon,
        }))
      );
    } catch (error) {
      console.error("Lỗi khi tìm địa chỉ:", error);
    }
  };

  const handleAddressSelect = (selectedOption) => {
    if (!selectedOption) return;
    setSearchInput(selectedOption.value);
    setFormData((prev) => ({
      ...prev,
      street: selectedOption.value,
    }));
    if (mapInstance.current) {
      mapInstance.current.setCenter([selectedOption.lon, selectedOption.lat]);
      markerRef.current.setLngLat([selectedOption.lon, selectedOption.lat]);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error("Unauthorized: Token is missing.");
      navigate("/login"); // Điều hướng người dùng đến trang đăng nhập nếu chưa đăng nhập
      return;
    }

    try {
      let orderItems = [];

      // Đảm bảo rằng giỏ hàng không rỗng và sản phẩm có thông tin đầy đủ
      for (const itemId in cartItems) {
        if (cartItems[itemId] > 0) {
          const itemInfo = books.find((book) => book._id === itemId);
          if (itemInfo) {
            orderItems.push({
              ...itemInfo,
              quantity: cartItems[itemId],
            });
          }
        }
      }

      const orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_charges,
        paymentMethod: method, // Đảm bảo gửi phương thức thanh toán
      };

      // Đặt hàng qua COD hoặc Stripe
      if (method === "cod") {
        const response = await axios.post(
          `${backend_url}/api/order/place`,
          orderData,
          { headers: { Authorization: `Bearer ${token}` } } // Đảm bảo token được gửi
        );
        if (response.data.success) {
          toast.success("Thanh toán thành công!");
          setCartItems({});
          navigate("/orders");
        } else {
          toast.error(response.data.message);
        }
      } else if (method === "stripe") {
        const response = await axios.post(
          `${backend_url}/api/order/stripe`,
          orderData,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Đảm bảo rằng token được gửi đúng
            },
          }
        );

        if (response.data.success) {
          window.location.replace(response.data.session_url);
        } else {
          toast.error(response.data.message);
        }
      } else {
        toast.error("Chưa chọn phương thức thanh toán.");
      }
    } catch (error) {
      console.error("Order submission failed:", error);
      toast.error("Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.");
    }
  };


  return (
    <section className="max-padd-container">
      <form onSubmit={onSubmitHandler} className="pt-28">
        <div className="flex flex-col xl:flex-row gap-20 xl:gap-28">
          <div className="flex flex-1 flex-col gap-3 text-[95%]">
            <Title title1={"Địa chỉ"} title2={"nhận hàng"} title1Styles={"h3"} />

            {/* First Name */}
            <input
              onChange={onChangeHandler}
              value={formData.firstName}
              type="text"
              name="firstName"
              placeholder="Họ"
              className="ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none"
              required
            />

            {/* Last Name */}
            <input
              onChange={onChangeHandler}
              value={formData.lastName}
              type="text"
              name="lastName"
              placeholder="Tên"
              className="ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none"
              required
            />

            <input
              onChange={onChangeHandler}
              value={formData.phone}
              type="tel"
              name="phone"
              placeholder="Số điện thoại"
              className="ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none"
              required
            />

            <Select
              inputValue={searchInput}
              onInputChange={handleSearch}
              options={searchResults}
              onChange={handleAddressSelect}
              placeholder="Nhập địa chỉ..."
              isClearable
            />

            {/* Hiển thị bản đồ */}
            <div ref={mapElement} style={{ height: "300px", width: "100%" }}></div>
          </div>
          {/* Right Side */}
          <div className="flex flex-1 flex-col">
            <CartTotal />
            <div className="my-6">
              <h3 className="bold-20 mb-5">
                Phương thức <span className="text-secondary">thanh toán</span>
              </h3>
              <div className="flex gap-3">
                <div onClick={() => setMethod("stripe")} className={`${method === "stripe" ? "btn-secondary" : "btn-white"} !py-1 text-xs cursor-pointer`}>Visa</div>
                <div onClick={() => setMethod("cod")} className={`${method === "cod" ? "btn-secondary" : "btn-white"} !py-1 text-xs cursor-pointer`}>Tiền mặt</div>
              </div>
            </div>
            <button type="submit" className="btn-secondaryOne">Đặt hàng</button>
          </div>
        </div>
      </form>
      <Footer />
    </section>
  );
};

export default PlaceOrder;
