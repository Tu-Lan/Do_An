import { useState, useEffect, useContext } from "react";
import CartTotal from "../components/CartTotal";
import Title from "../components/Title";
import Footer from "../components/Footer";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import Select from "react-select";
import Modal from "react-modal";

// Set app element for accessibility
Modal.setAppElement('#root');

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

  // Modal state for showing address selection
  const [isModalOpen, setIsModalOpen] = useState(false);

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

          // Tự động chọn địa chỉ mặc định nếu có
          const defaultAddress = response.data.addresses.find(address => address.isDefault);
          if (defaultAddress) {
            setSelectedAddress(defaultAddress);
            setFormData({
              firstName: defaultAddress.firstName,
              lastName: defaultAddress.lastName,
              street: defaultAddress.street,
              city: defaultAddress.city,
              state: defaultAddress.state,
              zipcode: defaultAddress.zipcode,
              country: defaultAddress.country,
              phone: defaultAddress.phone,
            });
          }
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
    setIsModalOpen(false); // Close modal after selection
  };

  const openModal = () => {
    setIsModalOpen(true); // Open modal when button is clicked
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close modal
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

            {/* Hiển thị thông tin địa chỉ mặc định nếu có */}
            {selectedAddress ? (
              <div className="mb-4">
                <p className="font-semibold">Địa chỉ nhận hàng:</p>
                <p>{`${selectedAddress.firstName} ${selectedAddress.lastName}`}</p>
                <p>{selectedAddress.street}</p>
                <p>{selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipcode}</p>
                <p>{selectedAddress.country}</p>
                <p>{selectedAddress.phone}</p>
              </div>
            ) : (
              <p>Không có địa chỉ mặc định.</p>
            )}

            {/* Nút thay đổi địa chỉ */}
            <button
              type="button"
              onClick={openModal}
              className="btn-secondary px-6 py-3 text-white bg-primary rounded-md hover:bg-primary-dark transition"
            >
              Thay đổi địa chỉ
            </button>

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

      {/* Modal for address selection */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Select Address"
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg w-11/12 sm:w-96">
          <h2 className="text-xl font-semibold mb-4">Chọn địa chỉ</h2>
          <Select
            options={addresses.map((address) => ({
              label: `${address.firstName} ${address.lastName} - ${address.street}`,
              value: address,
            }))}
            onChange={(option) => handleAddressSelect(option.value)}
            placeholder="Chọn địa chỉ nhận hàng"
            isClearable
          />
          <div className="mt-4 flex justify-between">
            <button
              onClick={closeModal}
              className="btn-secondary px-6 py-2 text-white bg-secondary rounded-md hover:bg-secondary-dark transition"
            >
              Đóng
            </button>
            <button
              onClick={closeModal}
              className="btn-secondary px-6 py-2 text-white bg-primary rounded-md hover:bg-primary-dark transition"
            >
              Chọn
            </button>
          </div>
        </div>
      </Modal>

      <Footer />
    </section>
  );
};

export default PlaceOrder;
