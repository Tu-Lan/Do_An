import { useState, useEffect, useContext } from "react";
import CartTotal from "../components/CartTotal";
import Title from "../components/Title";
import Footer from "../components/Footer";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import Select from "react-select";

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

  const [method, setMethod] = useState("cod"); 
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const [addresses, setAddresses] = useState([]); 
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    if (!token) {
      toast.error("Bạn chưa đăng nhập. Vui lòng đăng nhập tài khoản...");
      navigate("/login");
    } else {
      axios.get(`${backend_url}/api/user/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(response => {
          setAddresses(response.data.addresses); 
        })
        .catch(error => {
          console.error("Lỗi khi lấy địa chỉ:", error);
        });
    }
  }, [token, backend_url, navigate]);

  const handleAddressSelect = (selectedOption) => {
    if (selectedOption) {
      setSelectedAddress(selectedOption); 
      setFormData({
        firstName: selectedOption.firstName,
        lastName: selectedOption.lastName,
        street: selectedOption.street,
        city: selectedOption.city,
        state: selectedOption.state,
        zipcode: selectedOption.zipcode,
        country: selectedOption.country,
        phone: selectedOption.phone,
      });
    }
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error("Unauthorized: Token is missing.");
      navigate("/login");
      return;
    }

    try {
      let orderItems = [];

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
        paymentMethod: method,
      };

      if (method === "stripe") {
        const response = await axios.post(
          `${backend_url}/api/order/stripe`,
          orderData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          window.location.replace(response.data.session_url);
        } else {
          toast.error(response.data.message);
        }
      } else if (method === "cod") {
        const response = await axios.post(
          `${backend_url}/api/order/place`,
          orderData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          toast.success("Đặt hàng thành công!");
          setCartItems({});
          navigate("/orders");
        } else {
          toast.error(response.data.message);
        }
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

            <Select
              options={addresses.map((address) => ({
                label: `${address.firstName} ${address.lastName} - ${address.street}`,
                value: address,
              }))}
              onChange={(option) => handleAddressSelect(option.value)}
              placeholder="Chọn địa chỉ nhận hàng"
              isClearable
            />

            <input
              onChange={onChangeHandler}
              value={formData.firstName}
              type="text"
              name="firstName"
              placeholder="Họ"
              className="ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-primary outline-none"
              required
            />

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
            <CartTotal />
            <div className="my-6">
              <h3 className="bold-20 mb-5">
                Phương thức <span className="text-secondary">thanh toán</span>
              </h3>
              <div className="flex gap-3">
                <div
                  onClick={() => setMethod("stripe")}
                  className={`${method === "stripe" ? "btn-secondary" : "btn-white"} !py-1 text-xs cursor-pointer`}
                >
                  Visa
                </div>
                <div
                  onClick={() => setMethod("cod")}
                  className={`${method === "cod" ? "btn-secondary" : "btn-white"} !py-1 text-xs cursor-pointer`}
                >
                  Tiền mặt
                </div>
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
