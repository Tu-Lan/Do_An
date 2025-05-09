import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import Title from "../components/Title";
import Footer from "../components/Footer";

const Orders = () => {
  const { backend_url, token, currency, delivery_charges } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const cancelReasons = [
    "Tôi cần thay đổi sđt/địa chỉ nhận hàng",
    "Tôi cần thêm mã giảm giá",
    "Tôi cần thay đổi sản phẩm(số lượng,...)",
    "Thủ tục thanh toán rắc rối",
    "Tôi tìm được chỗ mua khác tốt hơn",
    "Tôi có không có nhu cầu mua nữa",
    "Tôi không tìm thấy lý do phù hợp"
  ];

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
          refunded: order.refunded,
          refundId: order.refundId,
          cancelReason: order.cancelReason,
          deliveryFailedReason: order.deliveryFailedReason,
          internalNote: order.internalNote,
          returnReason: order.returnReason,
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

  const openCancelModal = (orderId) => {
    setSelectedOrderId(orderId);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedOrderId(null);
    setCancelReason("");
  };

  const cancelOrder = async () => {
    if (!cancelReason) {
      alert("Vui lòng chọn lý do hủy đơn hàng!");
      return;
    }
    try {
      const response = await axios.post(
        `${backend_url}/api/order/cancel`,
        { orderId: selectedOrderId, reason: cancelReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        alert("Đã hủy đơn hàng thành công!");
        closeCancelModal();
        loadOrderData();
      } else {
        alert(`Lỗi: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Lỗi hủy đơn hàng. Vui lòng thử lại sau.");
    }
  };

  const getImageUrl = (image) => {
    if (!image) return "/fallback-image.png";
    return image.startsWith("http") || image.startsWith("/") ? image : `/${image}`;
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
            <p className="text-gray-500">
              Ngày đặt: {order.date ? new Date(order.date).toLocaleDateString("vi-VN") : "Không xác định"}
            </p>
            <p className="text-gray-500">
              Phương thức thanh toán: {order.paymentMethod === "Stripe" ? "Visa" : "Tiền mặt"}
            </p>
            {order.paymentMethod === "Stripe" && (
              <p className="text-gray-500">
                Trạng thái thanh toán: {order.payment ? "Đã thanh toán" : "Chờ thanh toán"}
              </p>
            )}
            <p className="text-gray-500">
              Trạng thái:{" "}
              {(() => {
                const normalizedStatus = order.status?.toLowerCase();
                switch (normalizedStatus) {
                  case "order placed":
                    return "Đã đặt hàng";
                  case "order confirmed":
                    return "Chờ xác nhận";
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
                  case "delivery failed":
                    return "Giao hàng thất bại";
                  case "returned":
                    return "Trả hàng/Hoàn tiền";
                  default:
                    return `Trạng thái không xác định (${order.status})`;
                }
              })()}
              {order.cancelReason && order.status === "Cancelled" && (
                <span className="text-gray-500"> (Lý do: {order.cancelReason})</span>
              )}
              {order.deliveryFailedReason && order.status === "Delivery Failed" && (
                <span className="text-gray-500"> (Lý do: {order.deliveryFailedReason})</span>
              )}
              {order.returnReason && order.status === "Returned" && (
                <span className="text-gray-500"> (Lý do: {order.returnReason})</span>
              )}
              {order.internalNote && (order.status === "Packing" || order.status === "Delivered") && (
                <span className="text-gray-500"> (Ghi chú: {order.internalNote})</span>
              )}
            </p>
            {order.paymentMethod === "Stripe" && order.status === "Cancelled" && (
              <p className="text-gray-500">
                Trạng thái hoàn tiền:{" "}
                {order.refunded ? (
                  <span className="text-green-600">
                    Đã hoàn tiền (ID: {order.refundId})
                  </span>
                ) : (
                  <span className="text-gray-600">Chưa hoàn tiền</span>
                )}
              </p>
            )}
            <div className="mt-4">
              {order.items?.map((item, i) => (
                <div key={i} className="flex gap-4 border-b py-2">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name ?? "Sản phẩm"}
                    width={55}
                    className="object-cover aspect-square rounded"
                    onError={(e) => {
                      e.currentTarget.src = "/fallback-image.png";
                    }}
                  />
                  <div>
                    <h5 className="font-medium">{item.name ?? "Sản phẩm"}</h5>
                    <p>Giá sản phẩm: {(item.price ?? 0).toLocaleString("vi-VN")} {currency}</p>
                    <p>Số lượng: {item.quantity ?? 0}</p>
                  </div>
                </div>
              ))}
              <p className="text-gray-500 mt-3">
                Phí vận chuyển: {(delivery_charges ?? 0).toLocaleString("vi-VN")} {currency}
              </p>
              <p className="text-gray-700 font-semibold">
                Tổng cộng:{" "}
                {((order.items?.reduce(
                  (total, item) => total + (item.price ?? 0) * (item.quantity ?? 0),
                  0
                ) ?? 0) + (delivery_charges ?? 0)).toLocaleString("vi-VN")} {currency}
              </p>
            </div>
            <div className="mt-4 flex gap-3">
              <Link to={`/order/${order.orderId}`} className="btn-primaryOne !px-2 !text-xs !py-1">
                Xem chi tiết
              </Link>
              {order.status === "Order Placed" && (
                <button
                  onClick={() => openCancelModal(order.orderId)}
                  className="btn-secondaryOne !px-1.5 !text-xs !py-1"
                >
                  Hủy đơn hàng
                </button>
              )}
              {order.status === "Delivered" && (
                <button
                  onClick={() => downloadInvoice(order.orderId)}
                  className="btn-primaryOne !px-1.5 !text-xs !py-1"
                >
                  Xuất hóa đơn
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Hủy đơn hàng</h3>
            <p className="text-gray-600 mb-4">Vui lòng chọn lý do hủy đơn hàng:</p>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primaryOne"
            >
              <option value="">-- Chọn lý do --</option>
              {cancelReasons.map((reason, index) => (
                <option key={index} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeCancelModal}
                className="py-2 px-4 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Đóng
              </button>
              <button
                onClick={cancelOrder}
                className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </section>
  );
};

export default Orders;