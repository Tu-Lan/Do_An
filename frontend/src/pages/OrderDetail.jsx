import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import Footer from "../components/Footer";

const OrderDetail = () => {
  const { orderId } = useParams(); // Lấy orderId từ URL
  const { backend_url, token, currency } = useContext(ShopContext);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await axios.get(`${backend_url}/api/order/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setOrder(response.data.order);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchOrderDetail();
  }, [orderId, backend_url, token]);

  if (!order) return <div>Đang tải...</div>;

  return (
    <section className="max-padd-container pt-28">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-6">Chi tiết đơn hàng #{order._id}</h2>

        {/* Thông tin khách hàng */}
        <div className="text-left">
          <h3 className="font-semibold mb-4">Thông tin khách hàng:</h3>
          <p>Tên: {order.address.firstName} {order.address.lastName}</p>
          <p>Địa chỉ: {order.address.street}, {order.address.city}</p>
          <p>Số điện thoại: {order.address.phone}</p>
          <p>Phương thức thanh toán: {order.paymentMethod}</p>
          <p>Trạng thái: {order.status}</p>
        </div>

        {/* Danh sách sản phẩm */}
        <h3 className="font-semibold my-4">Danh sách sản phẩm:</h3>
        <ul>
          {order.items.map((item, index) => (
            <li key={index} className="mb-4">
              <div className="flex gap-4">
                <img
                  src={item._id.image}
                  alt={item._id.name}
                  className="w-24 h-24 object-contain rounded"
                />
                <div className="flex flex-col">
                  <p className="font-semibold">{item._id.name}</p>
                  <p>Số lượng: {item.quantity}</p>
                  <p>Giá: {item._id.price} {currency}</p>
                  <p>Tổng: {item._id.price * item.quantity} {currency}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Tổng cộng */}
        <div className="flex justify-between mt-6">
          <p className="font-semibold text-lg">Tổng cộng: {order.amount} {currency}</p>
          <p className="text-gray-500">Ngày đặt hàng: {new Date(order.date).toLocaleDateString()}</p>
        </div>
      </div>
      <Footer />
    </section>
  );
};

export default OrderDetail;
