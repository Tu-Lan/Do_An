import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const AdminOrderDetail = ({ backend_url, token }) => {
  const { orderId } = useParams();
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
        console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
      }
    };
    fetchOrderDetail();
  }, [orderId, backend_url, token]);
  const getImageUrl = (image) => {
    if (!image) return "/fallback-image.png";
    return image.startsWith("http") || image.startsWith("/") ? image : `/${image}`;
  };

  if (!order) return <div>Đang tải...</div>;

  return (
    <div className="px-4 sm:px-8 mt-6 sm:mt-14">
      <h2 className="text-xl font-semibold mb-4">Chi tiết đơn hàng #{order._id}</h2>
      <p className="mb-2">Trạng thái: {order.status}</p>
      <p className="mb-2">Phương thức thanh toán: {order.paymentMethod}</p>
      <h3 className="text-lg font-medium mt-4 mb-2">Sản phẩm:</h3>
      {order.items.map((item, index) => (
        <div key={index} className="ml-4 mb-2">
          {/* <img
            src={item.image}
            alt={item.name}
            className="w-12 h-12 object-cover border border-gray-300 rounded"
          /> */}
          <img
            src={getImageUrl(item.image)}
            alt={item.name}
            width={55}
            className="object-cover aspect-square rounded"
            onError={(e) => {
              e.currentTarget.src = "/fallback-image.png";
            }}
          />
          <p>{item.name} - SL: {item.quantity} - Giá: {item.price.toLocaleString("vi-VN")}</p>
        </div>
      ))}
      <p className="mt-4">Tổng: {order.amount.toLocaleString("vi-VN")} đ</p>
      {order.address && (
        <div className="mt-6">
          <h4 className="text-lg font-medium">Thông tin giao hàng:</h4>
          <p>Tên người nhận: {order.address.firstName} {order.address.lastName}</p>
          <p>Số điện thoại: {order.address.phone}</p>
          <p>Địa chỉ: {order.address.street}, {order.address.city}, {order.address.state}, {order.address.zipcode}</p>
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetail;