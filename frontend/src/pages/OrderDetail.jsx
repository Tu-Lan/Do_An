import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import Footer from "../components/Footer";
import ReactStars from "react-rating-stars-component";
import { toast } from "react-toastify";

const OrderDetail = () => {
  const { orderId } = useParams();
  const { backend_url, token, currency, delivery_charges } = useContext(ShopContext);
  const [order, setOrder] = useState(null);
  const [review, setReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await axios.get(`${backend_url}/api/order/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setOrder(response.data.order);
          const reviewResponse = await axios.get(
            `${backend_url}/api/review/order/${orderId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setReview(reviewResponse.data.review);
        }
      } catch (error) {
        console.log(error);
        // toast.error("Lỗi khi tải chi tiết đơn hàng.");
      }
    };
    fetchOrderDetail();
  }, [orderId, backend_url, token]);

  const handleAddReview = async () => {
    try {
      const res = await axios.post(
        `${backend_url}/api/review/add`,
        { orderId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Cảm ơn bạn đã đánh giá!");
        setReview(res.data.review);
      } else {
        toast.error(res.data.message || "Không thể gửi đánh giá.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi gửi đánh giá.");
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;

    try {
      const response = await axios.post(
        `${backend_url}/api/order/cancel`,
        { orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setOrder({ ...order, status: "Cancelled", refunded: true }); // Cập nhật trạng thái hoàn tiền trên UI
      } else {
        toast.error(response.data.message || "Không thể hủy đơn hàng.");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      const message = error.response?.data?.message || "Lỗi khi hủy đơn hàng.";
      toast.error(message);
    }
  };

  // Hàm chuyển đổi phương thức thanh toán
  const getPaymentMethodDisplay = (method) => {
    switch (method.toLowerCase()) {
      case "stripe":
        return "Online";
      case "cod":
        return "Tiền mặt";
      default:
        return method;
    }
  };

  // Hàm chuyển đổi trạng thái đơn hàng sang tiếng Việt
  const getStatusDisplay = (status) => {
    switch (status.toLowerCase()) {
      case "order placed":
        return "Đã đặt hàng";
      case "shipped":
        return "Đã gửi";
      case "out of delivery":
        return "Đang giao";
      case "cancelled":
        return "Đã hủy";
      case "delivered":
        return "Đã giao";
      case "packing":
        return "Đang đóng gói";
      case "shipping":
        return "Đang vận chuyển";
      default:
        return `Trạng thái không xác định (${status})`;
    }
  };

  if (!order) return <div className="flex justify-center items-center h-screen text-gray-600 text-lg">Đang tải...</div>;

  return (
    <section className="max-w-6xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
          Chi tiết đơn hàng #{order._id}
        </h2>

        <div className="text-left bg-white p-6 rounded-xl shadow-sm mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Thông tin khách hàng
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
            <p>
              <span className="font-medium">Tên:</span>{" "}
              {order.address.firstName} {order.address.lastName}
            </p>
            <p>
              <span className="font-medium">Địa chỉ:</span>{" "}
              {order.address.street}, {order.address.city}
            </p>
            <p>
              <span className="font-medium">Số điện thoại:</span>{" "}
              {order.address.phone}
            </p>
            <p>
              <span className="font-medium">Phương thức thanh toán:</span>{" "}
              {getPaymentMethodDisplay(order.paymentMethod)}
            </p>
            <p>
              <span className="font-medium">Trạng thái:</span>{" "}
              {getStatusDisplay(order.status)}
            </p>
            {order.paymentMethod === "Stripe" && (
              <p className="text-gray-500">
                Trạng thái hoàn tiền:{" "}
                {order.refunded ? (
                  <span className="text-green-600">
                    Đã hoàn tiền (ID: {order.refundId}, Ngày: {new Date(order.refundDate).toLocaleDateString()})
                  </span>
                ) : (
                  <span className="text-gray-600">Chưa hoàn tiền</span>
                )}
              </p>
            )}
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Danh sách sản phẩm
        </h3>
        <ul className="space-y-4 mb-8">
          {order.items.map((item, index) => (
            <li
              key={index}
              className="flex flex-col sm:flex-row gap-4 items-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={item._id.image}
                alt={item._id.name}
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-lg"
              />
              <div className="flex-1 text-center sm:text-left">
                <p className="text-lg font-semibold text-gray-800">
                  {item._id.name}
                </p>
                <p className="text-gray-600">Số lượng: {item.quantity}</p>
                <p className="text-gray-600">
                  Giá: {item._id.price.toLocaleString("vi-VN")} {currency}
                </p>
                <p className="text-gray-600">
                  Thành tiền:{" "}
                  {(item._id.price * item.quantity).toLocaleString("vi-VN")}{" "}
                  {currency}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm mb-8">
          <p className="text-lg font-semibold text-gray-800">
            Tổng cộng:{" "}
            {(order.items.reduce((total, item) => total + item.price * item.quantity, 0) +
              delivery_charges).toLocaleString("vi-VN")}{" "}
            {currency}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-2 sm:mt-0">
            <p className="text-gray-500 text-sm">
              Ngày đặt hàng: {new Date(order.date).toLocaleDateString()}
            </p>
            {(order.status === "Order Placed" || order.status === "Order Confirmed") && (
              <button
                onClick={handleCancelOrder}
                className="py-2 px-4 bg-red-600 text-white bosses font-semibold rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
              >
                Hủy đơn hàng
              </button>
            )}
          </div>
        </div>

        {order.status.toLowerCase() === "delivered" && !review && (
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Đánh giá đơn hàng
            </h3>
            <div className="space-y-4 max-w-lg mx-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số sao
                </label>
                <div className="flex items-center justify-center gap-4">
                  <ReactStars
                    count={5}
                    value={rating}
                    onChange={setRating}
                    size={28}
                    activeColor="#ffd700"
                  />
                  <span className="text-gray-600 font-medium">{rating}/5</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhận xét
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primaryOne transition"
                  rows="5"
                  required
                />
              </div>
              <button
                onClick={handleAddReview}
                className="w-full py-3 bg-primaryOne text-white font-semibold rounded-lg shadow-sm hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-primaryOne transition"
              >
                Gửi đánh giá
              </button>
            </div>
          </div>
        )}

        {review ? (
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Đánh giá của bạn
            </h3>
            <div className="space-y-2 max-w-lg mx-auto">
              <p className="text-gray-600">
                <span className="font-medium">Số sao:</span>
              </p>
              <div className="flex items-center justify-center gap-4">
                <ReactStars
                  count={5}
                  value={review.rating}
                  edit={false}
                  size={28}
                  activeColor="#ffd700"
                />
                <span className="text-gray-600 font-medium">
                  {review.rating}/5
                </span>
              </div>
              <p className="text-gray-600">
                <span className="font-medium">Nhận xét:</span> {review.comment}
              </p>
            </div>
          </div>
        ) : (
          order.status.toLowerCase() !== "delivered" && (
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Chưa có đánh giá
              </h3>
              <p className="text-gray-600">
                Hãy đánh giá đơn hàng này sau khi nhận được sản phẩm.
              </p>
            </div>
          )
        )}
      </div>
      <Footer />
    </section>
  );
};

export default OrderDetail;