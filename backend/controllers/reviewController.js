import Review from '../models/reviewModel.js';
import Order from '../models/orderModel.js';

export const addReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    const userId = req.user.id; 
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
    }
    if (!order.userId || order.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền đánh giá đơn hàng này.' });
    }
    if (order.status !== 'Delivered') {
      return res.status(400).json({ success: false, message: 'Chỉ có thể đánh giá đơn hàng đã hoàn thành.' });
    }
    const existingReview = await Review.findOne({ orderId, userId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'Bạn đã đánh giá đơn hàng này.' });
    }
    const newReview = new Review({
      orderId,
      userId,
      rating,
      comment,
    });
    await newReview.save();
    res.status(201).json({ success: true, message: 'Đánh giá đã được thêm.', review: newReview });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.', error: error.message });
  }
};

export const getReviewByOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const review = await Review.findOne({ orderId }).populate("userId", "name");
    if (!review) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá cho đơn hàng này." });
    }
    res.status(200).json({ success: true, review });
  } catch (error) {
    console.error("Lỗi khi lấy đánh giá:", error);
    res.status(500).json({ success: false, message: "Đã xảy ra lỗi khi lấy đánh giá." });
  }
};
export const getReviewsByProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const orders = await Order.find({ "items._id": productId });
    if (!orders.length) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng nào chứa sản phẩm này." });
    }
    const orderIds = orders.map(order => order._id);
    const reviews = await Review.find({ orderId: { $in: orderIds } }).populate("userId", "name");
    if (!reviews.length) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá nào cho sản phẩm này." });
    }
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("Lỗi khi lấy đánh giá theo sản phẩm:", error);
    res.status(500).json({ success: false, message: "Đã xảy ra lỗi khi lấy đánh giá." });
  }
};
export const getReviewsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const reviews = await Review.find({ userId }).populate("orderId", "status productId");
    if (reviews.length === 0) {
      return res.status(404).json({ success: false, message: "Không có đánh giá nào của người dùng này." });
    }
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đánh giá của người dùng:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách đánh giá." });
  }
};
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá.' });
    }
    if (review.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa đánh giá này.' });
    }
    await Review.deleteOne({ _id: reviewId });
    res.status(200).json({ success: true, message: 'Đánh giá đã được xóa.' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.', error: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá.' });
    }
    if (review.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền chỉnh sửa đánh giá này.' });
    }
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    await review.save();
    res.status(200).json({ success: true, message: 'Đánh giá đã được cập nhật.', review });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.', error: error.message });
  }
};
