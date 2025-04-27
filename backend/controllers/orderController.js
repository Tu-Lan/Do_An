import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import Stripe from 'stripe';
import pdfkit from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const placeOrder = async (req, res) => {
  try {
    const { items, address, amount, paymentMethod } = req.body;
    const userId = req.user.id;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Không có sản phẩm nào trong đơn hàng." });
    }
    let orderItems = [];
    for (const item of items) {
      const product = await productModel.findById(item._id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Không tìm thấy sản phẩm ${item.name}.` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Không đủ hàng với sản phẩm: ${item.name}. Hiện có: ${product.quantity}`,
        });
      }
      if (!product.publisher) {
        return res.status(400).json({ success: false, message: `Sản phẩm ${item.name} thiếu thông tin nhà xuất bản.` });
      }
      orderItems.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        publisher: product.publisher,
        image: product.image,
      });
    }
    const orderData = {
      userId,
      items: orderItems,
      address,
      amount,
      paymentMethod,
      payment: false,
      date: Date.now(),
    };
    const newOrder = new orderModel(orderData);
    await newOrder.save();
    for (const item of orderItems) {
      const product = await productModel.findById(item._id);
      product.quantity -= item.quantity;
      if (product.quantity === 0) {
        console.warn(`Sản phẩm ${product.name} đang hết hàng.`);
      }
      await product.save();
    }
    res.status(201).json({ success: true, message: "Đơn hàng đã được đặt thành công.", order: newOrder });
  } catch (error) {
    console.error("Lỗi khi đặt đơn hàng:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ.", error: error.message });
  }
};

const placeOrderStripe = async (req, res) => {
  try {
    const { items, address, amount } = req.body;
    const userId = req.user.id;
    const { origin } = req.headers;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Không có sản phẩm nào trong đơn hàng." });
    }
    let orderItems = [];
    for (const item of items) {
      const product = await productModel.findById(item._id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Không tìm thấy sản phẩm ${item.name}.` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Không đủ hàng với sản phẩm: ${item.name}. Hiện có: ${product.quantity}`,
        });
      }
      orderItems.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        publisher: product.publisher,
        image: product.image,
      });
    }
    const totalAmountVND = amount + 1000;
    const minAmountVND = 11500;
    if (totalAmountVND < minAmountVND) {
      return res.status(400).json({
        success: false,
        message: `Tổng số tiền quá nhỏ. Số tiền tối thiểu cần thanh toán là khoảng 11,500 VND (50 cents).`,
      });
    }
    const orderData = {
      userId,
      items,
      amount: totalAmountVND,
      address,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    };
    const newOrder = new orderModel(orderData);
    await newOrder.save();
    const line_items = items.map((item) => ({
      price_data: {
        currency: 'vnd',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price),
      },
      quantity: item.quantity,
    }));
    line_items.push({
      price_data: {
        currency: 'vnd',
        product_data: { name: "Phí vận chuyển" },
        unit_amount: 1000,
      },
      quantity: 1,
    });
    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: 'payment',
    });
    newOrder.stripeSessionId = session.id;
    await newOrder.save();
    for (const item of orderItems) {
      const product = await productModel.findById(item._id);
      product.quantity -= item.quantity;
      if (product.quantity === 0) {
        console.warn(`Sản phẩm ${product.name} đang hết hàng.`);
      }
      await product.save();
    }
    res.status(200).json({
      success: true,
      message: "Phiên thanh toán đã được tạo.",
      session_url: session.url,
    });
  } catch (error) {
    console.error("Lỗi khi xử lý thanh toán Stripe:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ.", error: error.message });
  }
};

const createPaymentLink = async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'vnd',
            product_data: {
              name: `Đơn hàng #${orderId}`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });
    res.json({ success: true, paymentLink: session.url });
  } catch (error) {
    console.error("Lỗi khi tạo phiên thanh toán:", error);
    res.status(500).json({ success: false, message: "Không thể tạo liên kết thanh toán" });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Mã đơn hàng là bắt buộc" });
    }
    const order = await orderModel
      .findById(orderId)
      .populate({
        path: 'items._id',
        model: productModel,
        select: 'name description price author image category',
      });
    if (!order) {
      return res.status(404).json({ success: false, message: "Đơn hàng không tìm thấy" });
    }
    const formattedOrder = {
      _id: order._id,
      userId: order.userId,
      items: order.items.map((item) => ({
        _id: item._id._id,
        name: item._id.name,
        description: item._id.description,
        price: item.price,
        author: item._id.author,
        image: item._id.image || item.image || null,
        category: item._id.category,
        quantity: item.quantity,
        publisher: item.publisher,
      })),
      address: order.address,
      amount: order.amount,
      paymentMethod: order.paymentMethod,
      payment: order.payment,
      date: order.date,
      status: order.status,
      stripeSessionId: order.stripeSessionId,
      paymentIntentId: order.paymentIntentId,
      cancelReason: order.cancelReason,
      deliveryFailedReason: order.deliveryFailedReason,
      returnReason: order.returnReason,
      fraudReason: order.fraudReason,
      onHoldReason: order.onHoldReason,
      refundRequestReason: order.refundRequestReason,
      partialDeliveryNote: order.partialDeliveryNote,
      trackingNumber: order.trackingNumber,
      partialRefundAmount: order.partialRefundAmount,
      restockETA: order.restockETA,
      contactNote: order.contactNote,
      deliveryDate: order.deliveryDate,
      internalNote: order.internalNote,
      refunded: order.refunded,
      refundId: order.refundId,
    };
    res.json({ success: true, order: formattedOrder });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error.message });
  }
};

const allOrder = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Lỗi khi lấy tất cả đơn hàng:", error);
    res.json({ success: false, message: "Lỗi máy chủ" });
  }
};

const userOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderModel
      .find({ userId })
      .populate({
        path: 'items._id',
        model: productModel,
        select: 'name price image publisher category',
      })
      .lean();
    const formatted = orders.map((order) => ({
      _id: order._id,
      status: order.status,
      payment: order.payment,
      paymentMethod: order.paymentMethod,
      date: order.date,
      refunded: order.refunded || false,
      refundId: order.refundId || null,
      cancelReason: order.cancelReason || null,
      deliveryFailedReason: order.deliveryFailedReason || null,
      internalNote: order.internalNote || null,
      returnReason: order.returnReason || null,
      items: order.items.map((item) => ({
        _id: item._id._id,
        name: item._id.name,
        price: item.price,
        quantity: item.quantity,
        image: item._id.image || item.image || null,
        publisher: item._id.publisher,
        category: item._id.category,
      })),
      amount: order.amount,
      address: order.address,
      stripeSessionId: order.stripeSessionId,
      paymentIntentId: order.paymentIntentId,
    }));
    res.json({ success: true, orders: formatted });
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng của người dùng:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

const verifyStripe = async (req, res) => {
  const { orderId, success, userId } = req.body;
  try {
    if (success === "true") {
      const order = await orderModel.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: "Đơn hàng không tìm thấy" });
      }
      if (order.payment) {
        return res.status(400).json({ success: false, message: "Đơn hàng đã được thanh toán" });
      }
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      if (!session.payment_intent) {
        return res.status(400).json({ success: false, message: "Không tìm thấy PaymentIntent" });
      }
      order.paymentIntentId = session.payment_intent;
      order.payment = true;
      await order.save();
      await userModel.findByIdAndUpdate(userId, { payment: true });
      res.json({ success: true });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Thanh toán không thành công, đơn hàng đã bị hủy" });
    }
  } catch (error) {
    console.error("Lỗi khi xác minh thanh toán Stripe:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

const UpdateStatus = async (req, res) => {
  try {
    const {
      orderId,
      status,
      internalNote,
      cancelReason,
      deliveryFailedReason,
      returnReason,
      fraudReason,
      onHoldReason,
      refundRequestReason,
      partialDeliveryNote,
      trackingNumber,
      partialRefundAmount,
      restockETA,
      contactNote,
      deliveryDate,
    } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ success: false, message: "Mã đơn hàng và trạng thái là bắt buộc" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Đơn hàng không tìm thấy" });
    }

    // Kiểm tra nếu đơn hàng đã bị hủy
    if (order.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Không thể cập nhật trạng thái của đơn hàng đã hủy" });
    }

    switch (status) {
      case "Cancelled":
        if (!cancelReason) {
          return res.status(400).json({ success: false, message: "Lý do hủy đơn hàng là bắt buộc" });
        }
        if (order.status !== "Order Placed" && order.status !== "Order Confirmed") {
          return res.status(400).json({ success: false, message: "Đơn hàng không thể hủy ở giai đoạn này" });
        }
        order.cancelReason = cancelReason;
        if (order.paymentMethod === "Stripe" && order.payment) {
          const paymentIntentId = order.paymentIntentId;
          if (!paymentIntentId) {
            return res.status(400).json({ success: false, message: "Không tìm thấy thông tin thanh toán Stripe" });
          }
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          const chargeAmount = paymentIntent.amount;
          const refundAmount = chargeAmount - 1000;
          if (refundAmount <= 0) {
            return res.status(400).json({ success: false, message: "Số tiền hoàn lại không hợp lệ" });
          }
          const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: refundAmount,
          });
          if (refund.status === "succeeded" || refund.status === "pending") {
            order.refunded = true;
            order.refundId = refund.id;
          } else {
            return res.status(400).json({ success: false, message: `Hoàn tiền thất bại: trạng thái ${refund.status}` });
          }
        }
        for (const item of order.items) {
          const product = await productModel.findById(item.product);
          if (product) {
            product.quantity += item.quantity;
            await product.save();
          }
        }
        break;

      case "Delivery Failed":
        if (!deliveryFailedReason) {
          return res.status(400).json({ success: false, message: "Lý do giao hàng thất bại là bắt buộc" });
        }
        if (order.status !== "Out for Delivery") {
          return res.status(400).json({ success: false, message: "Đơn hàng không ở trạng thái đang giao" });
        }
        order.deliveryFailedReason = deliveryFailedReason;
        break;

      case "Returned":
        if (!returnReason) {
          return res.status(400).json({ success: false, message: "Lý do trả hàng là bắt buộc" });
        }
        order.returnReason = returnReason;
        if (order.paymentMethod === "Stripe" && order.payment && !order.refunded) {
          const paymentIntentId = order.paymentIntentId;
          if (!paymentIntentId) {
            return res.status(400).json({ success: false, message: "Không tìm thấy thông tin thanh toán Stripe" });
          }
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          const chargeAmount = paymentIntent.amount;
          const refundAmount = chargeAmount - 1000;
          if (refundAmount <= 0) {
            return res.status(400).json({ success: false, message: "Số tiền hoàn lại không hợp lệ" });
          }
          const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: refundAmount,
          });
          if (refund.status === "succeeded" || refund.status === "pending") {
            order.refunded = true;
            order.refundId = refund.id;
          } else {
            return res.status(400).json({ success: false, message: `Hoàn tiền thất bại: trạng thái ${refund.status}` });
          }
        }
        for (const item of order.items) {
          const product = await productModel.findById(item.product);
          if (product) {
            product.quantity += item.quantity;
            await product.save();
          }
        }
        break;

      case "Fraud Suspected":
        if (!fraudReason) {
          return res.status(400).json({ success: false, message: "Lý do nghi ngờ gian lận là bắt buộc" });
        }
        order.fraudReason = fraudReason;
        break;

      case "On Hold":
        if (!onHoldReason) {
          return res.status(400).json({ success: false, message: "Lý do tạm giữ đơn hàng là bắt buộc" });
        }
        order.onHoldReason = onHoldReason;
        break;

      case "Refund Requested":
        if (!refundRequestReason) {
          return res.status(400).json({ success: false, message: "Lý do yêu cầu hoàn tiền là bắt buộc" });
        }
        order.refundRequestReason = refundRequestReason;
        break;

      case "Partially Delivered":
        if (!partialDeliveryNote) {
          return res.status(400).json({ success: false, message: "Ghi chú giao hàng một phần là bắt buộc" });
        }
        order.partialDeliveryNote = partialDeliveryNote;
        break;

      case "Out for Delivery":
        if (!trackingNumber) {
          return res.status(400).json({ success: false, message: "Mã vận đơn là bắt buộc" });
        }
        order.trackingNumber = trackingNumber;
        break;

      case "Partially Refunded":
        if (!partialRefundAmount || partialRefundAmount <= 0) {
          return res.status(400).json({ success: false, message: "Số tiền hoàn lại một phần không hợp lệ" });
        }
        if (order.paymentMethod === "Stripe" && order.payment && !order.refunded) {
          const paymentIntentId = order.paymentIntentId;
          if (!paymentIntentId) {
            return res.status(400).json({ success: false, message: "Không tìm thấy thông tin thanh toán Stripe" });
          }
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          const chargeAmount = paymentIntent.amount;
          if (partialRefundAmount > chargeAmount - 1000) {
            return res.status(400).json({
              success: false,
              message: `Số tiền hoàn lại (₫${partialRefundAmount}) lớn hơn số tiền thanh toán khả dụng (₫${chargeAmount - 1000})`,
            });
          }
          const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: partialRefundAmount,
          });
          if (refund.status === "succeeded" || refund.status === "pending") {
            order.partialRefundAmount = partialRefundAmount;
            order.refunded = true;
            order.refundId = refund.id;
          } else {
            return res.status(400).json({ success: false, message: `Hoàn tiền thất bại: trạng thái ${refund.status}` });
          }
        }
        break;

      case "Awaiting Restock":
        if (restockETA) {
          order.restockETA = restockETA;
        }
        break;

      case "Customer Contacted":
        if (contactNote) {
          order.contactNote = contactNote;
        }
        break;

      case "Delivered":
        if (deliveryDate) {
          order.deliveryDate = deliveryDate;
        }
        if (internalNote) {
          order.internalNote = internalNote;
        }
        break;

      case "Packing":
        if (internalNote) {
          order.internalNote = internalNote;
        }
        break;

      default:
        break;
    }

    order.status = status;
    await order.save();

    res.json({ success: true, message: "Cập nhật trạng thái thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Mã đơn hàng là bắt buộc" });
    }
    if (!reason) {
      return res.status(400).json({ success: false, message: "Lý do hủy đơn hàng là bắt buộc" });
    }
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Đơn hàng không tìm thấy" });
    }
    if (order.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Đơn hàng đã được hủy trước đó" });
    }
    if (order.status !== "Order Placed" && order.status !== "Order Confirmed") {
      return res.status(400).json({ success: false, message: "Đơn hàng không thể bị hủy ở giai đoạn này" });
    }
    let refundId = null;
    if (order.paymentMethod === "Stripe" && order.payment) {
      const paymentIntentId = order.paymentIntentId;
      if (!paymentIntentId) {
        return res.status(400).json({ success: false, message: "Không tìm thấy thông tin thanh toán Stripe" });
      }
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        const chargeAmount = paymentIntent.amount;
        const refundAmount = chargeAmount - 1000;
        if (refundAmount <= 0) {
          return res.status(400).json({ success: false, message: "Số tiền hoàn lại không hợp lệ" });
        }
        if (refundAmount > chargeAmount) {
          return res.status(400).json({
            success: false,
            message: `Số tiền hoàn lại (₫${refundAmount}) lớn hơn số tiền thanh toán (₫${chargeAmount})`,
          });
        }
        const refund = await stripe.refunds.create({
          payment_intent: paymentIntentId,
          amount: refundAmount,
        });
        if (refund.status === "succeeded" || refund.status === "pending") {
          console.log(`Hoàn tiền ${refund.status} cho đơn hàng ${orderId}, Refund ID: ${refund.id}`);
          refundId = refund.id;
        } else {
          return res.status(400).json({ success: false, message: `Hoàn tiền thất bại: trạng thái ${refund.status}` });
        }
      } catch (refundError) {
        console.error("Lỗi khi hoàn tiền qua Stripe:", refundError);
        return res.status(500).json({ success: false, message: `Không thể hoàn tiền qua Stripe: ${refundError.message}` });
      }
    }
    order.status = "Cancelled";
    order.cancelReason = reason;
    if (refundId) {
      order.refunded = true;
      order.refundId = refundId;
    }
    await order.save();
    for (const item of order.items) {
      const product = await productModel.findById(item.product);
      if (product) {
        product.quantity += item.quantity;
        await product.save();
      }
    }
    res.json({ success: true, message: "Hủy đơn hàng thành công và hoàn tiền (nếu có)." });
  } catch (error) {
    console.error("Lỗi khi hủy đơn hàng:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

const failDelivery = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Mã đơn hàng là bắt buộc" });
    }
    if (!reason) {
      return res.status(400).json({ success: false, message: "Lý do giao hàng thất bại là bắt buộc" });
    }
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Đơn hàng không tìm thấy" });
    }
    if (order.status !== "Out for Delivery") {
      return res.status(400).json({ success: false, message: "Đơn hàng không ở trạng thái đang giao" });
    }
    order.status = "Delivery Failed";
    order.deliveryFailedReason = reason;
    await order.save();
    res.json({ success: true, message: "Cập nhật trạng thái giao hàng thất bại thành công" });
  } catch (error) {
    console.error("Lỗi khi đánh dấu giao hàng thất bại:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

const getOrderStats = async (req, res) => {
  try {
    const stats = await orderModel.find({});
    res.json({ success: true, stats });
  } catch (error) {
    console.error("Lỗi khi lấy thống kê đơn hàng:", error);
    res.json({ success: false, message: "Lỗi máy chủ" });
  }
};

const getRevenueStats = async (req, res) => {
  try {
    const deliveredOrders = await orderModel
      .find({ status: "Delivered" })
      .populate("items.product");
    let totalRevenue = 0;
    let totalProfit = 0;
    let totalCost = 0;
    deliveredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const product = item.product;
        if (!product) return;
        const quantity = item.quantity;
        const purchasePrice = product.price || 0;
        const sellingPrice = item.price || product.salePrice || 0;
        const cost = purchasePrice * quantity;
        const revenue = sellingPrice * quantity;
        const profit = revenue - cost;
        totalCost += cost;
        totalRevenue += revenue;
        totalProfit += profit;
      });
    });
    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalCost,
        totalProfit,
        totalOrders: deliveredOrders.length,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy thống kê doanh thu:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

const getOrderCounts = async (req, res) => {
  try {
    const deliveredOrders = await orderModel.find({ status: "Delivered" });
    const totalOrders = deliveredOrders.length;
    const totalProducts = deliveredOrders.reduce((acc, order) => {
      const productQty = order.items.reduce((sum, p) => sum + p.quantity, 0);
      return acc + productQty;
    }, 0);
    res.json({ success: true, totalOrders, totalProducts });
  } catch (error) {
    console.error("Lỗi khi lấy số lượng đơn hàng:", error);
    res.json({ success: false, message: "Lỗi máy chủ" });
  }
};

const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Mã đơn hàng là bắt buộc" });
    }
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Đơn hàng không tìm thấy" });
    }
    const invoiceDir = path.join(__dirname, '..', 'invoices');
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir);
    }
    const fileName = `Hoadon${orderId}.pdf`;
    const filePath = path.join(invoiceDir, fileName);
    const fontPath = path.join(__dirname, '..', 'assets', 'fonts', 'Roboto-Regular.ttf');
    const doc = new pdfkit();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.registerFont('Roboto', fontPath);
    doc.font('Roboto');
    doc.fontSize(16).text('NHÀ SÁCH TRI THỨC', { align: 'center' });
    doc.fontSize(12).text('Địa chỉ: Thôn Rền, Cảnh Hưng, Tiên Du, Bắc Ninh', { align: 'center' });
    doc.text('ĐT: 0879817410', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text('HÓA ĐƠN BÁN HÀNG', { align: 'center', underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Tên khách hàng: ${order.address.firstName} ${order.address.lastName}`);
    doc.text(`Địa chỉ: ${order.address.street}, ${order.address.city}`);
    doc.moveDown();
    doc.text('STT   TÊN HÀNG                              SỐ LƯỢNG       ĐƠN GIÁ       THÀNH TIỀN', { underline: true });
    order.items.forEach((item, index) => {
      const totalPrice = item.quantity * item.price;
      doc.text(
        `${(index + 1).toString().padEnd(10)}${item.name.padEnd(45)}${item.quantity.toString().padEnd(20)}${item.price.toString().padEnd(15)}${totalPrice}`
      );
    });
    doc.moveDown();
    doc.text(`CỘNG: ${order.amount - 1000} đ`, { align: 'right' });
    doc.text("PHÍ SHIP: 1000 đ", { align: 'right' });
    doc.text(`Thành tiền: ${order.amount} đ`, { align: 'right' });
    doc.moveDown();
    const currentDate = new Date();
    doc.text(`Ngày ${currentDate.getDate()} tháng ${currentDate.getMonth() + 1} năm ${currentDate.getFullYear()}`, {
      align: 'right',
    });
    doc.moveDown();
    doc.text(`KHÁCH HÀNG`, { align: 'left' });
    doc.text('NGƯỜI BÁN HÀNG', { align: 'right' });
    doc.moveDown();
    doc.text(`${order.address.firstName} ${order.address.lastName}`, { align: 'left' });
    doc.text('Đắc Quyết', { align: 'right' });
    doc.end();
    stream.on('finish', () => {
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error("Lỗi khi tải hóa đơn:", err);
          res.status(500).json({ success: false, message: "Lỗi khi tạo hóa đơn" });
        }
        fs.unlinkSync(filePath);
      });
    });
  } catch (error) {
    console.error("Lỗi khi tạo hóa đơn:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

export {
  placeOrder,
  getOrderDetail,
  placeOrderStripe,
  allOrder,
  userOrders,
  verifyStripe,
  failDelivery,
  UpdateStatus,
  getOrderStats,
  generateInvoice,
  cancelOrder,
  getRevenueStats,
  getOrderCounts,
  createPaymentLink,
};