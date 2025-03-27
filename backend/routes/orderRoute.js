import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import { allOrder, cancelOrder, generateInvoice, getOrderDetail, getOrderStats, placeOrder, placeOrderStripe, UpdateStatus, userOrders, verifyStripe } from '../controllers/orderController.js';
import authUser from '../middleware/auth.js';

const orderRouter = express.Router();

//for admin
orderRouter.post('/list', adminAuth, allOrder)
orderRouter.post('/status', adminAuth, UpdateStatus)

//for payment
orderRouter.post('/place', authUser, placeOrder)
orderRouter.post('/stripe', authUser, placeOrderStripe)

//verify payment
orderRouter.post('/verifyStripe', authUser, verifyStripe)

//for user
orderRouter.post('/userorders', authUser, userOrders)

//cancel order
orderRouter.post('/cancel', authUser, cancelOrder);

//report
orderRouter.get('/stats', adminAuth, getOrderStats);

//invoice
orderRouter.get('/invoice/:orderId', authUser, generateInvoice);

//orderDetail
orderRouter.get('/:orderId', getOrderDetail);
export default orderRouter;