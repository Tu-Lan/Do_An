import { backend_url, currency } from '../App';
import axios from 'axios';
import { toast } from 'react-toastify';
import { TfiPackage } from 'react-icons/tfi';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // State cho ô tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');

  // Lấy danh sách tất cả đơn hàng
  const fetchAllOrders = async () => {
    if (!token) {
      return null;
    }
    try {
      const response = await axios.post(
        backend_url + '/api/order/list',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Cập nhật trạng thái đơn hàng
  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backend_url + '/api/order/status',
        { orderId, status: event.target.value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        await fetchAllOrders();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Lọc đơn hàng theo ngày
  const filterOrdersByDate = () => {
    if (!startDate || !endDate) {
      return orders;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    return orders.filter((order) => {
      const orderDate = new Date(order.date);
      return orderDate >= start && orderDate <= end;
    });
  };

  // Lọc đơn hàng theo ô tìm kiếm
  const filterOrdersBySearchTerm = (ordersList) => {
    if (!searchTerm.trim()) {
      return ordersList;
    }
    const lowerSearch = searchTerm.toLowerCase();
    return ordersList.filter((order) => {
      const orderId = (order._id || '').toLowerCase();
      const phone = (order.address?.phone || '').toLowerCase();
      const fullName = (
        (order.address?.firstName || '') +
        ' ' +
        (order.address?.lastName || '')
      ).toLowerCase();
      const productNames = order.items
        .map((item) => (item.name || '').toLowerCase())
        .join(' ');
      return (
        orderId.includes(lowerSearch) ||
        phone.includes(lowerSearch) ||
        fullName.includes(lowerSearch) ||
        productNames.includes(lowerSearch)
      );
    });
  };

  // Đặt lại bộ lọc ngày
  const resetDateFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  // Gộp hai hàm lọc
  const filteredByDate = filterOrdersByDate();
  const finalFilteredOrders = filterOrdersBySearchTerm(filteredByDate);

  return (
    <div className="px-4 sm:px-8 mt-6 sm:mt-14">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Danh sách đơn hàng</h2>

      {/* Bộ lọc ngày */}
      <div className="flex gap-6 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <button
          onClick={resetDateFilters}
          className="self-end px-6 py-3 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Reset
        </button>
      </div>

      {/* Ô tìm kiếm */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
        <input
          type="text"
          value={searchTerm}
          placeholder="Nhập mã đơn, số điện thoại, tên người đặt, tên sách..."
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {finalFilteredOrders.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Đơn hàng từ {startDate} đến {endDate}
          </h3>
          <div className="space-y-6">
            {finalFilteredOrders.map((order) => (
              <div
                key={order._id}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[0.5fr_2fr_1fr_0.5fr_1fr] gap-6 items-start p-6 bg-white rounded-lg shadow-lg"
              >
                {/* Icon Section */}
                <div className="hidden xl:flex items-center justify-center ring-1 ring-slate-200 rounded bg-blue-100 p-4">
                  <TfiPackage className="text-3xl text-blue-500" />
                </div>

                {/* Order Details */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="font-medium text-gray-700">Sách:</span>
                    <div className="flex flex-col">
                      {order.items.map((item, index) => (
                        <p key={index} className="text-gray-600">
                          {item.name} x {item.quantity}
                        </p>
                      ))}
                    </div>
                  </div>
                  <p>
                    <span className="font-medium text-gray-700">Tên người đặt:</span>{' '}
                    {order.address.firstName + ' ' + order.address.lastName}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Địa chỉ:</span>{' '}
                    {`${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.zipcode}`}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Số điện thoại:</span>{' '}
                    {order.address.phone}
                  </p>
                </div>

                {/* Payment and Date Details */}
                <div className="space-y-3">
                  <p>
                    <span className="font-medium text-gray-700">Tổng sách:</span>{' '}
                    {order.items.length}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Phương thức:</span>{' '}
                    {order.paymentMethod}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Trạng thái:</span>{' '}
                    {order.payment ? 'Done' : 'Pending'}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Ngày đặt:</span>{' '}
                    {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>

                {/* Price */}
                <div className="font-medium text-gray-700">
                  <span>Giá:</span> {order.amount}
                  {currency}
                </div>

                {/* Status Dropdown */}
                <div className="space-y-3">
                  <Link
                    to={`/admin/order/${order._id}`}
                    className="inline-block px-4 py-2 rounded bg-indigo-500 text-white text-center hover:bg-indigo-600"
                  >
                    Xem chi tiết
                  </Link>
                  <select
                    onChange={(event) => statusHandler(event, order._id)}
                    value={order.status}
                    className="p-3 ring-1 ring-slate-200 rounded bg-blue-50 text-sm font-medium text-gray-700"
                  >
                    <option value="Order Placed">Đã đặt hàng</option>
                    <option value="Packing">Đang đóng hàng</option>
                    <option value="Shipping">Đang giao hàng</option>
                    <option value="Delivered">Đã nhận</option>
                    <option value="Cancelled">Đã hủy</option>
                    <option value="Out of delivery">Không thể vận chuyển</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      )}
      
    </div>
  );
};

export default Orders;