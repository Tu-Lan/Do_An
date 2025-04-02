import express from 'express';
import { addReview, getReviewsByProduct, deleteReview, updateReview } from '../controllers/reviewController.js';
import authUser from '../middleware/auth.js';

const reviewRouter = express.Router();

reviewRouter.post('/add', authUser, addReview);
reviewRouter.get('/product/:productId', getReviewsByProduct);
reviewRouter.delete('/delete/:reviewId', authUser, deleteReview);
reviewRouter.put('/update/:reviewId', authUser, updateReview);

export default reviewRouter;