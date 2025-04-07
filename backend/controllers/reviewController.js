import Review from '../models/reviewModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js'; 

export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
    }

    const newReview = new Review({
      productId,
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

export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId }).populate('userId', 'name');

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.', error: error.message });
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