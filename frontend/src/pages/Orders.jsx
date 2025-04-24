import { Link } from "react-router-dom"; // Import Link
import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import Title from "../components/Title";
import Footer from "../components/Footer";

const Orders = () => {
  const { backend_url, token, currency, delivery_charges } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null;
      }

      const response = await axios.post(
        `${backend_url}/api/order/userorders`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const orders = response.data.orders.map((order) => ({
          orderId: order._id,
          status: order.status,
          payment: order.payment,
          paymentMethod: order.paymentMethod,
          date: order.date,
          items: order.items,
        }));
        setOrderData(orders.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const response = await axios.get(
        `${backend_url}/api/order/invoice/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Lỗi tạo hoá đơn.");
    }
  };

  const cancelOrder = async (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      try {
        const response = await axios.post(
          `${backend_url}/api/order/cancel`,
          { orderId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          alert("Đã hủy đơn hàng thành công!");
          loadOrderData();
        } else {
          alert(response.data.message);
        }
      } catch (error) {
        console.error("Error cancelling order:", error);
        alert("Lỗi hủy đơn hàng.");
      }
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <section className="max-padd-container">
      <div className="pt-28 pb-1">
        <Title title1={"Danh sách"} title2={"đơn hàng"} title1Styles={"h3"} />
        {orderData.map((order, index) => (
          <div key={index} className="bg-white p-4 mt-5 rounded-lg shadow">
            <h4 className="font-semibold text-lg">Số đơn hàng {orderData.length - index}</h4>
            <p className="text-gray-500">Ngày đặt: {new Date(order.date).toLocaleString()}</p>
            <p className="text-gray-500">Phương thức thanh toán:
              {order.paymentMethod === "Stripe" && "Visa"}
              {order.paymentMethod === "cod" && "Tiền mặt"}
            </p>
            <p className="text-gray-500">Trạng thái:
              {(() => {
                const normalizedStatus = order.status?.toLowerCase();
                console.log("Normalized Order Status:", normalizedStatus); 
                switch (normalizedStatus) {
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
                    return `Trạng thái không xác định (${order.status})`; 
                }
              })()}
            </p>
            <div className="mt-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 border-b py-2">
                  <img src={item.image} alt={item.name} width={55} className="object-cover aspect-square rounded" />
                  <div>
                    <h5 className="font-medium">{item.name}</h5>
                    <p>
                      Giá sản phẩm: {item.price.toLocaleString('vi-VN')}{currency}
                    </p>
                    <p>Số lượng: {item.quantity}</p>
                  </div>
                </div>
              ))}
              <p className="text-gray-500 mt-3">
                Phí vận chuyển: {delivery_charges.toLocaleString('vi-VN')}{currency}
              </p>
              <p className="text-gray-700 font-semibold">
                Tổng cộng:{" "}
                {(order.items.reduce((total, item) => total + item.price * item.quantity, 0) +
                  delivery_charges).toLocaleString('vi-VN')}
                {currency}
              </p>
            </div>
            <div className="mt-4 flex gap-3">
              <Link to={`/order/${order.orderId}`} className="btn-primaryOne !px-2 !text-xs !py-1">
                Xem chi tiết
              </Link>

              {order.status === "Order Placed" && (
                <button
                  onClick={() => cancelOrder(order.orderId)}
                  className="btn-secondaryOne !px-1.5 !text-xs !py-1"
                >
                  Hủy đơn hàng
                </button>
              )}

              {order.status === "Delivered" && (
                <>
                  <button
                    onClick={() => downloadInvoice(order.orderId)}
                    className="btn-primaryOne !px-1.5 !text-xs !py-1"
                  >
                    Xuất hóa đơn
                  </button>

                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </section>
  );
};

export default Orders;

