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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [batchStatus, setBatchStatus] = useState('');
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [statusForm, setStatusForm] = useState({
    cancelReason: '',
    deliveryFailedReason: '',
    returnReason: '',
    fraudReason: '',
    onHoldReason: '',
    refundRequestReason: '',
    partialDeliveryNote: '',
    trackingNumber: '',
    partialRefundAmount: '',
    restockETA: '',
    contactNote: '',
    deliveryDate: '',
    internalNote: '',
  });

  const fetchAllOrders = async () => {
    if (!token) return;
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
      console.error('Lỗi khi tải danh sách đơn hàng:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    }
  };

  const statusHandler = async (orderId) => {
    if (!selectedStatus) {
      toast.error('Vui lòng chọn trạng thái');
      return;
    }
    try {
      const payload = { orderId, status: selectedStatus };
      switch (selectedStatus) {
        case 'Cancelled':
          if (!statusForm.cancelReason) {
            toast.error('Lý do hủy đơn hàng là bắt buộc');
            return;
          }
          payload.cancelReason = statusForm.cancelReason;
          break;
        case 'Delivery Failed':
          if (!statusForm.deliveryFailedReason) {
            toast.error('Lý do giao hàng thất bại là bắt buộc');
            return;
          }
          payload.deliveryFailedReason = statusForm.deliveryFailedReason;
          break;
        case 'Returned':
          if (!statusForm.returnReason) {
            toast.error('Lý do trả hàng là bắt buộc');
            return;
          }
          payload.returnReason = statusForm.returnReason;
          break;
        case 'Fraud Suspected':
          if (!statusForm.fraudReason) {
            toast.error('Lý do nghi ngờ gian lận là bắt buộc');
            return;
          }
          payload.fraudReason = statusForm.fraudReason;
          break;
        case 'On Hold':
          if (!statusForm.onHoldReason) {
            toast.error('Lý do tạm giữ đơn hàng là bắt buộc');
            return;
          }
          payload.onHoldReason = statusForm.onHoldReason;
          break;
        case 'Refund Requested':
          if (!statusForm.refundRequestReason) {
            toast.error('Lý do yêu cầu hoàn tiền là bắt buộc');
            return;
          }
          payload.refundRequestReason = statusForm.refundRequestReason;
          break;
        case 'Partially Delivered':
          if (!statusForm.partialDeliveryNote) {
            toast.error('Ghi chú giao hàng một phần là bắt buộc');
            return;
          }
          payload.partialDeliveryNote = statusForm.partialDeliveryNote;
          break;
        case 'Out for Delivery':
          if (!statusForm.trackingNumber) {
            toast.error('Mã vận đơn là bắt buộc');
            return;
          }
          payload.trackingNumber = statusForm.trackingNumber;
          break;
        case 'Partially Refunded':
          if (!statusForm.partialRefundAmount || isNaN(statusForm.partialRefundAmount) || statusForm.partialRefundAmount <= 0) {
            toast.error('Số tiền hoàn lại một phần không hợp lệ');
            return;
          }
          payload.partialRefundAmount = Number(statusForm.partialRefundAmount);
          break;
        case 'Awaiting Restock':
          if (statusForm.restockETA) {
            payload.restockETA = new Date(statusForm.restockETA).getTime();
          }
          break;
        case 'Customer Contacted':
          if (statusForm.contactNote) {
            payload.contactNote = statusForm.contactNote;
          }
          break;
        case 'Delivered':
          if (statusForm.deliveryDate) {
            payload.deliveryDate = new Date(statusForm.deliveryDate).getTime();
          }
          if (statusForm.internalNote) {
            payload.internalNote = statusForm.internalNote;
          }
          break;
        case 'Packing':
          if (statusForm.internalNote) {
            payload.internalNote = statusForm.internalNote;
          }
          break;
        default:
          break;
      }

      const response = await axios.post(
        backend_url + '/api/order/status',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success('Cập nhật trạng thái thành công');
        await fetchAllOrders();
        setSelectedOrderId(null);
        setSelectedStatus('');
        setStatusForm({
          cancelReason: '',
          deliveryFailedReason: '',
          returnReason: '',
          fraudReason: '',
          onHoldReason: '',
          refundRequestReason: '',
          partialDeliveryNote: '',
          trackingNumber: '',
          partialRefundAmount: '',
          restockETA: '',
          contactNote: '',
          deliveryDate: '',
          internalNote: '',
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const batchStatusHandler = async () => {
    if (!batchStatus) {
      toast.error('Vui lòng chọn trạng thái mới');
      return;
    }
    const filteredOrders = filterOrdersByStatus();
    if (filteredOrders.length === 0) {
      toast.error('Không có đơn hàng nào để cập nhật');
      return;
    }
    try {
      const payload = { status: batchStatus };
      switch (batchStatus) {
        case 'Cancelled':
          if (!statusForm.cancelReason) {
            toast.error('Lý do hủy đơn hàng là bắt buộc');
            return;
          }
          payload.cancelReason = statusForm.cancelReason;
          break;
        case 'Delivery Failed':
          if (!statusForm.deliveryFailedReason) {
            toast.error('Lý do giao hàng thất bại là bắt buộc');
            return;
          }
          payload.deliveryFailedReason = statusForm.deliveryFailedReason;
          break;
        case 'Returned':
          if (!statusForm.returnReason) {
            toast.error('Lý do trả hàng là bắt buộc');
            return;
          }
          payload.returnReason = statusForm.returnReason;
          break;
        case 'Fraud Suspected':
          if (!statusForm.fraudReason) {
            toast.error('Lý do nghi ngờ gian lận là bắt buộc');
            return;
          }
          payload.fraudReason = statusForm.fraudReason;
          break;
        case 'On Hold':
          if (!statusForm.onHoldReason) {
            toast.error('Lý do tạm giữ đơn hàng là bắt buộc');
            return;
          }
          payload.onHoldReason = statusForm.onHoldReason;
          break;
        case 'Refund Requested':
          if (!statusForm.refundRequestReason) {
            toast.error('Lý do yêu cầu hoàn tiền là bắt buộc');
            return;
          }
          payload.refundRequestReason = statusForm.refundRequestReason;
          break;
        case 'Partially Delivered':
          if (!statusForm.partialDeliveryNote) {
            toast.error('Ghi chú giao hàng một phần là bắt buộc');
            return;
          }
          payload.partialDeliveryNote = statusForm.partialDeliveryNote;
          break;
        case 'Out for Delivery':
          if (!statusForm.trackingNumber) {
            toast.error('Mã vận đơn là bắt buộc');
            return;
          }
          payload.trackingNumber = statusForm.trackingNumber;
          break;
        case 'Partially Refunded':
          if (!statusForm.partialRefundAmount || isNaN(statusForm.partialRefundAmount) || statusForm.partialRefundAmount <= 0) {
            toast.error('Số tiền hoàn lại một phần không hợp lệ');
            return;
          }
          payload.partialRefundAmount = Number(statusForm.partialRefundAmount);
          break;
        case 'Awaiting Restock':
          if (statusForm.restockETA) {
            payload.restockETA = new Date(statusForm.restockETA).getTime();
          }
          break;
        case 'Customer Contacted':
          if (statusForm.contactNote) {
            payload.contactNote = statusForm.contactNote;
          }
          break;
        case 'Delivered':
          if (statusForm.deliveryDate) {
            payload.deliveryDate = new Date(statusForm.deliveryDate).getTime();
          }
          if (statusForm.internalNote) {
            payload.internalNote = statusForm.internalNote;
          }
          break;
        case 'Packing':
          if (statusForm.internalNote) {
            payload.internalNote = statusForm.internalNote;
          }
          break;
        default:
          break;
      }

      for (const order of filteredOrders) {
        await axios.post(
          backend_url + '/api/order/status',
          { ...payload, orderId: order._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      toast.success(`Cập nhật trạng thái hàng loạt thành công cho ${filteredOrders.length} đơn hàng`);
      await fetchAllOrders();
      setShowBatchForm(false);
      setBatchStatus('');
      setStatusForm({
        cancelReason: '',
        deliveryFailedReason: '',
        returnReason: '',
        fraudReason: '',
        onHoldReason: '',
        refundRequestReason: '',
        partialDeliveryNote: '',
        trackingNumber: '',
        partialRefundAmount: '',
        restockETA: '',
        contactNote: '',
        deliveryDate: '',
        internalNote: '',
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái hàng loạt:', error);
      toast.error('Không thể cập nhật trạng thái hàng loạt');
    }
  };

  const handleStatusChange = (orderId, status) => {
    setSelectedOrderId(orderId);
    setSelectedStatus(status);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setStatusForm((prev) => ({ ...prev, [name]: value }));
  };

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

  const filterOrdersByStatus = () => {
    let filtered = filterOrdersBySearchTerm(filterOrdersByDate());
    if (filterStatus) {
      filtered = filtered.filter((order) => order.status === filterStatus);
    }
    return filtered;
  };

  const resetDateFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  const finalFilteredOrders = filterOrdersByStatus();

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'Order Placed', label: 'Đã đặt hàng' },
    { value: 'Order Confirmed', label: 'Xác nhận đơn hàng' },
    { value: 'Packing', label: 'Đang đóng hàng' },
    { value: 'Out for Delivery', label: 'Đang vận chuyển' },
    { value: 'Delivered', label: 'Đã nhận' },
    { value: 'Cancelled', label: 'Đã hủy' },
    { value: 'Delivery Failed', label: 'Giao hàng thất bại' },
    { value: 'Returned', label: 'Trả hàng' },
    { value: 'Payment Failed', label: 'Thanh toán thất bại' },
    { value: 'Partially Delivered', label: 'Giao hàng một phần' },
    { value: 'On Hold', label: 'Tạm giữ' },
    { value: 'Refund Requested', label: 'Yêu cầu hoàn tiền' },
    { value: 'Partially Refunded', label: 'Hoàn tiền một phần' },
    { value: 'Awaiting Restock', label: 'Chờ nhập kho' },
    { value: 'Customer Contacted', label: 'Đã liên hệ khách hàng' },
    { value: 'Fraud Suspected', label: 'Nghi ngờ gian lận' },
  ];

  const getStatusLabel = (status) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option ? option.label : status;
  };

  const renderStatusForm = () => {
    if (!selectedOrderId || !selectedStatus) return null;
    return (
      <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold mb-2">Cập nhật trạng thái đơn hàng</h4>
        {selectedStatus === 'Cancelled' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Lý do hủy</label>
            <textarea
              name="cancelReason"
              value={statusForm.cancelReason}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập lý do hủy đơn hàng"
            />
          </div>
        )}
        {selectedStatus === 'Delivery Failed' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Lý do giao hàng thất bại</label>
            <textarea
              name="deliveryFailedReason"
              value={statusForm.deliveryFailedReason}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập lý do giao hàng thất bại"
            />
          </div>
        )}
        {selectedStatus === 'Returned' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Lý do trả hàng</label>
            <textarea
              name="returnReason"
              value={statusForm.returnReason}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập lý do trả hàng"
            />
          </div>
        )}
        {selectedStatus === 'Fraud Suspected' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Lý do nghi ngờ gian lận</label>
            <textarea
              name="fraudReason"
              value={statusForm.fraudReason}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập lý do nghi ngờ gian lận"
            />
          </div>
        )}
        {selectedStatus === 'On Hold' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Lý do tạm giữ</label>
            <textarea
              name="onHoldReason"
              value={statusForm.onHoldReason}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập lý do tạm giữ đơn hàng"
            />
          </div>
        )}
        {selectedStatus === 'Refund Requested' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Lý do yêu cầu hoàn tiền</label>
            <textarea
              name="refundRequestReason"
              value={statusForm.refundRequestReason}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập lý do yêu cầu hoàn tiền"
            />
          </div>
        )}
        {selectedStatus === 'Partially Delivered' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Ghi chú giao hàng một phần</label>
            <textarea
              name="partialDeliveryNote"
              value={statusForm.partialDeliveryNote}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập ghi chú giao hàng một phần"
            />
          </div>
        )}
        {selectedStatus === 'Out for Delivery' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Mã vận đơn</label>
            <input
              type="text"
              name="trackingNumber"
              value={statusForm.trackingNumber}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập mã vận đơn"
            />
          </div>
        )}
        {selectedStatus === 'Partially Refunded' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Số tiền hoàn lại một phần</label>
            <input
              type="number"
              name="partialRefundAmount"
              value={statusForm.partialRefundAmount}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập số tiền hoàn lại"
            />
          </div>
        )}
        {selectedStatus === 'Awaiting Restock' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Thời gian dự kiến nhập kho</label>
            <input
              type="date"
              name="restockETA"
              value={statusForm.restockETA}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        )}
        {selectedStatus === 'Customer Contacted' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Ghi chú liên hệ</label>
            <textarea
              name="contactNote"
              value={statusForm.contactNote}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập ghi chú liên hệ khách hàng"
            />
          </div>
        )}
        {selectedStatus === 'Delivered' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Ngày giao hàng</label>
              <input
                type="datetime-local"
                name="deliveryDate"
                value={statusForm.deliveryDate}
                onChange={handleFormChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Ghi chú nội bộ</label>
              <textarea
                name="internalNote"
                value={statusForm.internalNote}
                onChange={handleFormChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Nhập ghi chú nội bộ"
              />
            </div>
          </>
        )}
        {selectedStatus === 'Packing' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Ghi chú nội bộ</label>
            <textarea
              name="internalNote"
              value={statusForm.internalNote}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập ghi chú nội bộ"
            />
          </div>
        )}
        <div className="flex gap-4">
          <button
            onClick={() => statusHandler(selectedOrderId)}
            className="px-4 py-2 bg-indigo-500 text-white rounded-md shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Xác nhận
          </button>
          <button
            onClick={() => {
              setSelectedOrderId(null);
              setSelectedStatus('');
              setStatusForm({
                cancelReason: '',
                deliveryFailedReason: '',
                returnReason: '',
                fraudReason: '',
                onHoldReason: '',
                refundRequestReason: '',
                partialDeliveryNote: '',
                trackingNumber: '',
                partialRefundAmount: '',
                restockETA: '',
                contactNote: '',
                deliveryDate: '',
                internalNote: '',
              });
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-md shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Hủy
          </button>
        </div>
      </div>
    );
  };

  const renderBatchStatusForm = () => {
    if (!showBatchForm) return null;
    return (
      <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold mb-2">Cập nhật trạng thái hàng loạt</h4>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Chọn trạng thái mới</label>
          <select
            value={batchStatus}
            onChange={(e) => setBatchStatus(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Chọn trạng thái</option>
            {statusOptions.filter(opt => opt.value !== '').map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {batchStatus === 'Cancelled' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Lý do hủy</label>
            <textarea
              name="cancelReason"
              value={statusForm.cancelReason}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập lý do hủy đơn hàng"
            />
          </div>
        )}
        {batchStatus === 'Delivery Failed' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Lý do giao hàng thất bại</label>
            <textarea
              name="deliveryFailedReason"
              value={statusForm.deliveryFailedReason}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập lý do giao hàng thất bại"
            />
          </div>
        )}
        {batchStatus === 'Returned' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Lý do trả hàng</label>
            <textarea
              name="returnReason"
              value={statusForm.returnReason}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập lý do trả hàng"
            />
          </div>
        )}
        {batchStatus === 'Fraud Suspected' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Lý do nghi ngờ gian lận</label>
            <textarea
              name="fraudReason"
              value={statusForm.fraudReason}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập lý do nghi ngờ gian lận"
            />
          </div>
        )}
        {batchStatus === 'On Hold' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Lý do tạm giữ</label>
            <textarea
              name="onHoldReason"
              value={statusForm.onHoldReason}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập lý do tạm giữ đơn hàng"
            />
          </div>
        )}
        {batchStatus === 'Refund Requested' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Lý do yêu cầu hoàn tiền</label>
            <textarea
              name="refundRequestReason"
              value={statusForm.refundRequestReason}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập lý do yêu cầu hoàn tiền"
            />
          </div>
        )}
        {batchStatus === 'Partially Delivered' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Ghi chú giao hàng một phần</label>
            <textarea
              name="partialDeliveryNote"
              value={statusForm.partialDeliveryNote}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập ghi chú giao hàng một phần"
            />
          </div>
        )}
        {batchStatus === 'Out for Delivery' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Mã vận đơn</label>
            <input
              type="text"
              name="trackingNumber"
              value={statusForm.trackingNumber}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập mã vận đơn"
            />
          </div>
        )}
        {batchStatus === 'Partially Refunded' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Số tiền hoàn lại một phần</label>
            <input
              type="number"
              name="partialRefundAmount"
              value={statusForm.partialRefundAmount}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập số tiền hoàn lại"
            />
          </div>
        )}
        {batchStatus === 'Awaiting Restock' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Thời gian dự kiến nhập kho</label>
            <input
              type="date"
              name="restockETA"
              value={statusForm.restockETA}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        )}
        {batchStatus === 'Customer Contacted' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Ghi chú liên hệ</label>
            <textarea
              name="contactNote"
              value={statusForm.contactNote}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập ghi chú liên hệ khách hàng"
            />
          </div>
        )}
        {batchStatus === 'Delivered' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Ngày giao hàng</label>
              <input
                type="datetime-local"
                name="deliveryDate"
                value={statusForm.deliveryDate}
                onChange={handleFormChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Ghi chú nội bộ</label>
              <textarea
                name="internalNote"
                value={statusForm.internalNote}
                onChange={handleFormChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Nhập ghi chú nội bộ"
              />
            </div>
          </>
        )}
        {batchStatus === 'Packing' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Ghi chú nội bộ</label>
            <textarea
              name="internalNote"
              value={statusForm.internalNote}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nhập ghi chú nội bộ"
            />
          </div>
        )}
        <div className="flex gap-4">
          <button
            onClick={batchStatusHandler}
            className="px-4 py-2 bg-indigo-500 text-white rounded-md shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Xác nhận
          </button>
          <button
            onClick={() => {
              setShowBatchForm(false);
              setBatchStatus('');
              setStatusForm({
                cancelReason: '',
                deliveryFailedReason: '',
                returnReason: '',
                fraudReason: '',
                onHoldReason: '',
                refundRequestReason: '',
                partialDeliveryNote: '',
                trackingNumber: '',
                partialRefundAmount: '',
                restockETA: '',
                contactNote: '',
                deliveryDate: '',
                internalNote: '',
              });
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-md shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Hủy
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 sm:px-8 mt-6 sm:mt-14">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Danh sách đơn hàng</h2>

      <div className="flex flex-wrap gap-6 mb-6">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={resetDateFilters}
          className="self-end px-6 py-3 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Đặt lại
        </button>
        <button
          onClick={() => setShowBatchForm(true)}
          className="self-end px-6 py-3 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Cập nhật trạng thái hàng loạt
        </button>
      </div>

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
          <div className="flex flex-wrap gap-4 mb-4 items-center">
            <h3 className="text-xl font-semibold text-gray-800">
              Đơn hàng từ {startDate || 'bắt đầu'} đến {endDate || 'hiện tại'} ({filterStatus ? getStatusLabel(filterStatus) : 'Tất cả trạng thái'})
            </h3>
          </div>
          {renderBatchStatusForm()}
          <div className="space-y-6">
            {finalFilteredOrders.map((order) => (
              <div
                key={order._id}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[0.5fr_2fr_1fr_0.5fr_1fr] gap-6 items-start p-6 bg-white rounded-lg shadow-lg"
              >
                <div className="hidden xl:flex items-center justify-center ring-1 ring-slate-200 rounded bg-blue-100 p-4">
                  <TfiPackage className="text-3xl text-blue-500" />
                </div>

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

                <div className="font-medium text-gray-700">
                  <span>Giá:</span> {order.amount.toLocaleString("vi-VN")}
                  {currency}
                </div>

                <div className="space-y-3">
                  <Link
                    to={`/admin/order/${order._id}`}
                    className="inline-block px-4 py-2 rounded bg-indigo-500 text-white text-center hover:bg-indigo-600"
                  >
                    Xem chi tiết
                  </Link>
                  <select
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    value={selectedOrderId === order._id ? selectedStatus : order.status}
                    className="p-3 ring-1 ring-slate-200 rounded bg-blue-50 text-sm font-medium text-gray-700"
                  >
                    {statusOptions.filter(opt => opt.value !== '').map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {selectedOrderId === order._id && renderStatusForm()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {finalFilteredOrders.length === 0 && (
        <p className="text-gray-600">Không tìm thấy đơn hàng phù hợp.</p>
      )}
    </div>
  );
};

export default Orders;