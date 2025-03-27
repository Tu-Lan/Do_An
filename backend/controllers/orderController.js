import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe';
import pdfkit from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import productModel from "../models/productModel.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// const placeOrder = async (req, res) => {
//   try {
//     const { items, address, amount, paymentMethod } = req.body;
//     const userId = req.user.id;

//     if (!items || items.length === 0) {
//       return res.status(400).json({ success: false, message: "Không có sản phẩm nào trong đơn hàng." });
//     }

//     // Kiểm tra số lượng sản phẩm
//     for (const item of items) {
//       const product = await productModel.findById(item._id);
//       if (!product) {
//         return res.status(404).json({ success: false, message: `Không tìm thấy sản phẩm ${item.name} .` });
//       }

//       if (product.quantity < item.quantity) {
//         return res.status(400).json({
//           success: false,
//           message: `Không đủ hàng với sản phẩm: ${item.name}. Hiện có: ${product.quantity}`,
//         });
//       }
//     }
//     const order = new orderModel({
//       userId,
//       items,
//       address,
//       amount,
//       status: "Order placed",
//       paymentMethod: "COD",
//       payment: false,
//       date: Date.now(),
//     });
//     await order.save();

//     // Cập nhật số lượng sản phẩm
//     for (const item of items) {
//       const product = await productModel.findById(item._id);
//       product.quantity -= item.quantity;

//       // Cảnh báo nếu hết hàng
//       if (product.quantity === 0) {
//         console.warn(`Sản phẩm ${product.name} đang hết hàng.`);
//       }

//       await product.save();
//     }

//     res.status(201).json({ success: true, message: "Đơn hàng đặt thành công.", order });
//   } catch (error) {
//     console.error("Error placing order:", error);
//     res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
//   }
// };


// const placeOrderStripe = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { items, amount, address } = req.body;
//     const { origin } = req.headers;

//     const orderData = {
//       userId,
//       items,
//       amount,
//       address,
//       paymentMethod: "Stripe",
//       payment: false,
//       date: Date.now()
//     };
//     const newOrder = new orderModel(orderData);
//     await newOrder.save();

//     const line_items = items.map((item) => ({
//       price_data: {
//         currency: 'usd',
//         product_data: {
//           name: item.name
//         },
//         unit_amount: Math.round(item.price * 100)  // Chuyển giá từ USD sang cent
//       },
//       quantity: item.quantity
//     }));

//     // Thêm phí giao hàng vào danh sách mặt hàng
//     line_items.push({
//       price_data: {
//         currency: 'usd',
//         product_data: {
//           name: "Delivery charges"
//         },
//         unit_amount: deliveryChargesUSD * 100  // Phí giao hàng tính bằng cent
//       },
//       quantity: 1
//     });

//     const session = await stripe.checkout.sessions.create({
//       success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
//       cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
//       line_items,
//       mode: 'payment'
//     });

//     res.json({ success: true, session_url: session.url });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };
const placeOrder = async (req, res) => {
  try {
    const { items, address, amount, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Không có sản phẩm nào trong đơn hàng." });
    }

    let orderItems = [];

    // Kiểm tra số lượng sản phẩm và các trường yêu cầu
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

      // Kiểm tra trường 'publisher' của sản phẩm
      if (!product.publisher) {
        return res.status(400).json({ success: false, message: `Sản phẩm ${item.name} thiếu thông tin nhà xuất bản.` });
      }

      // Thêm sản phẩm vào danh sách orderItems
      orderItems.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        publisher: product.publisher, // Đảm bảo publisher có mặt
        image: product.image,
      });
    }

    // Tạo đơn hàng
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

    // Cập nhật số lượng sản phẩm
    for (const item of orderItems) {
      const product = await productModel.findById(item._id);
      product.quantity -= item.quantity;

      // Cảnh báo nếu hết hàng
      if (product.quantity === 0) {
        console.warn(`Sản phẩm ${product.name} đang hết hàng.`);
      }

      await product.save();
    }

    res.status(201).json({ success: true, message: "Đơn hàng đã được đặt thành công.", order: newOrder });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
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

    // Check stock for each product
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
    }

    // Calculate total amount including delivery charges
    const totalAmountVND = amount + 10000; // Amount + delivery charges (10,000 VND)
    const minAmountVND = 11500; // Minimum amount for Stripe (50 cents, approximately 11,500 VND)

    // Check if the total amount is below the minimum
    if (totalAmountVND < minAmountVND) {
      return res.status(400).json({
        success: false,
        message: `Tổng số tiền quá nhỏ. Số tiền tối thiểu cần thanh toán là khoảng 11,500 VND (50 cents).`,
      });
    }

    // Create order in the database first
    const orderData = {
      userId,
      items,
      amount: totalAmountVND, // Set the total amount
      address,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    };
    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Create Stripe session
    const line_items = items.map((item) => ({
      price_data: {
        currency: 'vnd',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // Convert price to VND (in cents)
      },
      quantity: item.quantity,
    }));

    // Add delivery charges to the line items
    const deliveryChargesVND = 10000; // Delivery charges in VND
    line_items.push({
      price_data: {
        currency: 'vnd',
        product_data: {
          name: "Delivery charges",
        },
        unit_amount: deliveryChargesVND * 100, // Convert to cents
      },
      quantity: 1,
    });

    // Create the Stripe session
    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: 'payment',
    });

    // Update product stock
    for (const item of items) {
      const product = await productModel.findById(item._id);
      product.quantity -= item.quantity;

      // Log if product is out of stock
      if (product.quantity === 0) {
        console.warn(`Sản phẩm ${product.name} đang hết hàng.`);
      }

      await product.save();
    }

    res.status(200).json({
      success: true,
      message: "Session thanh toán được tạo.",
      session_url: session.url,
    });
  } catch (error) {
    console.error("Error processing Stripe order:", error);
    res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
  }
};


const createPaymentLink = async (req, res) => {
  try {
    const { orderId, amount } = req.body; 
    // Tạo session thanh toán Stripe
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'vnd',  
            product_data: {
              name: `Đơn hàng #${orderId}`,
            },
            unit_amount: amount * 100,  // Số tiền thanh toán tính bằng cent
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    // Trả về session.url cho frontend để tạo mã QR
    res.json({ success: true, paymentLink: session.url });
  } catch (error) {
    console.error("Error creating payment session:", error);
    res.status(500).json({ success: false, message: "Không thể tạo thanh toán" });
  }
};

export { createPaymentLink };

// Lấy chi tiết đơn hàng đầy đủ
const getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Kiểm tra xem orderId có được cung cấp không
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Mã đơn hàng là bắt buộc" });
    }

    // Lấy chi tiết đơn hàng từ database và populate các trường liên quan đến sản phẩm
    const order = await orderModel.findById(orderId)
      .populate({
        path: 'items._id', // Populate thông tin sản phẩm
        model: productModel, // Đảm bảo rằng bạn đang populate từ productModel
        select: 'name description price author image category' // Chỉ lấy những trường cần thiết
      });

    if (!order) {
      return res.status(404).json({ success: false, message: "Đơn hàng không tìm thấy" });
    }

    // Trả về thông tin chi tiết đơn hàng với thông tin đầy đủ về sản phẩm
    res.json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const allOrder = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

const userOrders = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy trực tiếp userId
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

const verifyStripe = async (req, res) => {
  const { orderId, success, userId } = req.body;
  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true })
      await userModel.findByIdAndUpdate(userId, { payment: true })
      res.json({ success: true });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

const UpdateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

//hủy đơn hàng
// const cancelOrder = async (req, res) => {
//   try {
//     const { orderId } = req.body;

//     // Kiểm tra orderId
//     if (!orderId) {
//       return res.status(400).json({ success: false, message: "ID đơn hàng không tồn tại" });
//     }

//     // Tìm đơn hàng
//     const order = await orderModel.findById(orderId);
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Đơn hàng khó tìm" });
//     }

//     // Kiểm tra trạng thái đơn hàng
//     if (order.status === "Cancelled") {
//       return res.status(400).json({ success: false, message: "Đơn hàng được hủy" });
//     }

//     if (order.status !== "Order placed") {
//       return res.status(400).json({ success: false, message: "Đơn hàng không thể bị hủy ở giai đoạn này" });
//     }

//     // Cập nhật trạng thái thành 'Cancelled'
//     order.status = "Cancelled";
//     await order.save();

//     res.json({ success: true, message: "Hủy đơn hàng thành công" });
//   } catch (error) {
//     console.error("Error cancelling order:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };
// const cancelOrder = async (req, res) => {
//   try {
//     const { orderId } = req.body;

//     // Kiểm tra orderId
//     if (!orderId) {
//       return res.status(400).json({ success: false, message: "ID đơn hàng là bắt buộc" });
//     }

//     // Tìm đơn hàng
//     const order = await orderModel.findById(orderId);
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Đơn hàng không tìm thấy" });
//     }

//     // Kiểm tra trạng thái đơn hàng
//     if (order.status === "Cancelled") {
//       return res.status(400).json({ success: false, message: "Đơn hàng đã được hủy trước đó" });
//     }

//     if (order.status !== "Order placed") {
//       return res.status(400).json({ success: false, message: "Đơn hàng không thể bị hủy ở giai đoạn này" });
//     }

//     // Cập nhật trạng thái thành 'Cancelled'
//     order.status = "Cancelled";
//     await order.save();

//     res.json({ success: true, message: "Hủy đơn hàng thành công" });
//   } catch (error) {
//     console.error("Error cancelling order:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Kiểm tra orderId
    if (!orderId) {
      return res.status(400).json({ success: false, message: "ID đơn hàng là bắt buộc" });
    }

    // Tìm đơn hàng
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Đơn hàng không tìm thấy" });
    }

    // Kiểm tra trạng thái đơn hàng
    if (order.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Đơn hàng đã được hủy trước đó" });
    }

    if (order.status !== "Order placed") {
      return res.status(400).json({ success: false, message: "Đơn hàng không thể bị hủy ở giai đoạn này" });
    }

    // Cập nhật trạng thái thành 'Cancelled'
    order.status = "Cancelled";
    await order.save();

    // Cộng lại số lượng sản phẩm trong kho
    for (const item of order.items) {
      const product = await productModel.findById(item._id);
      if (product) {
        product.quantity += item.quantity; // Cộng lại số lượng sản phẩm
        await product.save();
      }
    }

    res.json({ success: true, message: "Hủy đơn hàng thành công và cập nhật lại kho." });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getOrderStats = async (req, res) => {
  try {
    // Lấy tất cả dữ liệu đơn hàng mà không lọc ở backend
    const stats = await orderModel.find({});
    res.json({ success: true, stats });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
// const getOrderStats = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     // Kiểm tra đầu vào
//     if (!startDate || !endDate || isNaN(new Date(startDate)) || isNaN(new Date(endDate))) {
//       return res.status(400).json({ success: false, message: "Invalid startDate or endDate" });
//     }


//     // Giới hạn khoảng thời gian
//     const maxDays = 30;
//     const generateDateRange = (start, end) => {
//       const dates = [];
//       let currentDate = new Date(start);
//       const lastDate = new Date(end);

//       while (currentDate <= lastDate) {
//         dates.push(new Date(currentDate).toISOString().split("T")[0]);
//         currentDate.setDate(currentDate.getDate() + 1);
//       }
//       return dates;
//     };

//     const dateRange = generateDateRange(startDate, endDate);
//     if (dateRange.length > maxDays) {
//       return res.status(400).json({
//         success: false,
//         message: `Date range exceeds the maximum of ${maxDays} days.`,
//       });
//     }

//     const stats = await orderModel.aggregate([
//       {
//         $match: {
//           date: { $gte: new Date(startDate), $lte: new Date(endDate) },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
//             paymentMethod: "$paymentMethod",
//           },
//           totalOrders: { $sum: 1 },
//           totalAmount: { $sum: "$amount" },
//         },
//       },
//       {
//         $project: {
//           date: "$_id.date",
//           paymentMethod: "$_id.paymentMethod",
//           totalOrders: 1,
//           totalAmount: 1,
//           _id: 0,
//         },
//       },
//     ]);

//     const fullStats = dateRange.flatMap(date =>
//       ["COD", "Stripe"].map(paymentMethod => {
//         const stat = stats.find(
//           s => s.date === date && s.paymentMethod === paymentMethod
//         );
//         return stat || { date, paymentMethod, totalOrders: 0, totalAmount: 0 };
//       })
//     );

//     res.json({ success: true, startDate, endDate, stats: fullStats });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };



const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(orderId);
    // Correct extraction from body
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Mã đơn hàng là bắt buộc" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Đơn hàng không tìm thấy" });
    }

    // Tạo đường dẫn thư mục invoices
    const invoiceDir = path.join(__dirname, '..', 'invoices');
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir);
    }

    // Tạo tên và đường dẫn file PDF
    const fileName = `invoice_${orderId}.pdf`;
    const filePath = path.join(invoiceDir, fileName);

    // Đường dẫn font hỗ trợ tiếng Việt
    const fontPath = path.join(__dirname, '..', 'assets', 'fonts', 'Roboto-Regular.ttf');

    // Tạo file PDF
    const doc = new pdfkit();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Sử dụng font tiếng Việt
    doc.registerFont('Roboto', fontPath);
    doc.font('Roboto');

    // Nội dung hóa đơn
    doc.fontSize(20).text('HÓA ĐƠN MUA HÀNG', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Mã đơn hàng: ${orderId}`);
    doc.text(`Ngày đặt hàng: ${new Date(order.date).toLocaleDateString()}`);
    doc.text(`Phương thức thanh toán: ${order.paymentMethod}`);
    doc.text(`Trạng thái: ${order.status}`);
    doc.moveDown();

    doc.text('Thông tin khách hàng:', { underline: true });
    const customerName = `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim();
    doc.text(`Tên: ${customerName}`);
    doc.text(`Địa chỉ: ${order.address.street}, ${order.address.city}`);
    doc.text(`Số điện thoại: ${order.address.phone}`);
    doc.moveDown();

    doc.text('Danh sách sản phẩm:', { underline: true });
    order.items.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name} - ${item.quantity} x ${item.price} đ`);
    });
    doc.moveDown();

    doc.fontSize(14).text(`Tổng cộng: ${order.amount} đ`, { align: 'right' });

    doc.end();

    // Khi hoàn thành việc tạo PDF, gửi file về client
    stream.on('finish', () => {
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({ success: false, message: "Hóa đơn lỗi" });
        }

        // Xóa file sau khi tải xong
        fs.unlinkSync(filePath);
      });
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export { placeOrder,getOrderDetail, placeOrderStripe, allOrder, userOrders, verifyStripe, UpdateStatus, getOrderStats, generateInvoice, cancelOrder }