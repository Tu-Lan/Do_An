import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    }
  ],
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, required: true, default: 'Order Placed' },
  paymentMethod: { type: String, required: true },
  payment: { type: Boolean, required: true, default: false },
  paymentIntentId: { type: String },
  stripeSessionId: { type: String },
  refundId: { type: String },
  refunded: { type: Boolean, default: false },
  date: { type: Number, required: true ,default: Date.now},
  cancelReason: { type: String }, // Lý do hủy đơn hàng
  deliveryFailedReason: { type: String }, // Lý do giao hàng thất bại
  internalNote: { type: String }, // Ghi chú nội bộ (cho Packing, Delivered)
  returnReason: { type: String }, // Lý do trả hàng
}, { minimize: false });

const orderModel = mongoose.model('Order', orderSchema);
export default orderModel;