import express from 'express';
import { addReview, getReviewByOrder, deleteReview, updateReview, getReviewsByUser, getReviewsByProduct } from '../controllers/reviewController.js';
import authUser from '../middleware/auth.js';

const reviewRouter = express.Router();

// Thêm đánh giá
reviewRouter.post('/add', authUser, addReview);

// Lấy đánh giá theo đơn hàng
reviewRouter.get('/order/:orderId', getReviewByOrder);
reviewRouter.get('/product/:productId', getReviewsByProduct);
// Lấy tất cả đánh giá của người dùng
reviewRouter.get('/user/:userId', getReviewsByUser);

// Xóa đánh giá
reviewRouter.delete('/:reviewId', authUser, deleteReview);

// Cập nhật đánh giá
reviewRouter.put('/:reviewId', authUser, updateReview);

export default reviewRouter;
