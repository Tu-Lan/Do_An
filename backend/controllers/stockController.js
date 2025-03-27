import stockModel from '../models/stockModel.js';

export const addToStock = async (req, res) => {
  try {
    const { name, author, image, price, quantity } = req.body;
    let stockItem = await stockModel.findOne({ name, author });

    if (stockItem) {
      stockItem.quantity += Number(quantity);
    } else {
      stockItem = new stockModel({ name, author, image, price, quantity });
    }
    await stockItem.save();
    res.status(201).json({ success: true, message: 'Sách đã được thêm vào kho.', stockItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi thêm vào kho.', error: error.message });
  }
};