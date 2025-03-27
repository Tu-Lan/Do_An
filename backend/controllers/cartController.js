import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";


// const addToCart = async (req, res) => {
//   try {
//     const { itemId, quantity } = req.body;
//     const userId = req.user.id;

//     if (!itemId || typeof quantity !== 'number') {
//       return res.status(400).json({ success: false, message: "Item ID and quantity are required." });
//     }

//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found." });
//     }

//     // Thêm hoặc trừ sản phẩm trong giỏ hàng
//     if (user.cartData[itemId]) {
//       user.cartData[itemId] += quantity;
//       // Nếu số lượng <= 0, xóa sản phẩm khỏi giỏ hàng
//       if (user.cartData[itemId] <= 0) {
//         delete user.cartData[itemId];
//       }
//     } else {
//       if (quantity > 0) {
//         user.cartData[itemId] = quantity;
//       }
//     }

//     await user.save();

//     return res.status(200).json({ success: true, message: "Cart updated successfully.", cart: user.cartData });
//   } catch (error) {
//     console.error("Error updating cart:", error);
//     return res.status(500).json({ success: false, message: "Internal server error." });
//   }
// };

const addToCart = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const userId = req.user.id;

    if (!itemId || typeof quantity !== "number") {
      return res.status(400).json({ success: false, message: "Mã sản phẩm và số lượng là bắt buộc." });
    }

    const product = await productModel.findById(itemId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm." });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ success: false, message: `Không đủ hàng cho sản phẩm: ${product.name}. Hiện có: ${product.quantity}` });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
    }

    if (user.cartData[itemId]) {
      user.cartData[itemId] += quantity;

      // Ensure the cart quantity doesn't exceed stock
      if (user.cartData[itemId] > product.quantity) {
        user.cartData[itemId] = product.quantity;
        return res.status(400).json({
          success: false,
          message: `Bạn chỉ có thể thêm ${product.quantity} của ${product.name} vào giỏ hàng.`,
        });
      }
    } else {
      if (quantity > 0) {
        user.cartData[itemId] = quantity;
      }
    }

    await user.save();

    return res.status(200).json({ success: true, message: "Giỏ hàng cập nhật thành công.", cart: user.cartData });
  } catch (error) {
    console.error("Error updating cart:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};



// const updateCart = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { itemId, quantity } = req.body;
//     const userData = await userModel.findById(userId);
//     const cartData = await userData.cartData;

//     cartData[itemId] = quantity;

//     await userModel.findByIdAndUpdate(userId, { cartData });
//     res.json({ success: true, message: "Your cart updated" });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// }


// const getUserCart = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const userData = await userModel.findById(userId);
//     const cartData = await userData.cartData || {};

//     res.json({ success: true, cartData });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// }
const updateCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, quantity } = req.body;

    const product = await productModel.findById(itemId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm.", data: null });
    }

    if (quantity > product.quantity) {
      return res.status(400).json({
        success: false,
        message: `Chỉ có thể thêm ${product.quantity} của ${product.name} vào giỏ hàng.`,
        data: null,
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng.", data: null });
    }

    if (quantity <= 0) {
      delete user.cartData[itemId];
    } else {
      user.cartData[itemId] = quantity;
    }

    await user.save();
    res.status(200).json({ success: true, message: "Giỏ hàng đã được cập nhật.", data: { cart: user.cartData } });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ success: false, message: "Internal server error.", data: null });
  }
};

const getUserCart = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ success: false, message: "Không tìm thấy người dùng.", data: null });
    }

    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng.", data: null });
    }

    const cartData = userData.cartData || {};
    res.status(200).json({ success: true, message: "Đã tải giỏ hàng.", data: { cart: cartData } });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ success: false, message: "Internal server error.", data: null });
  }
};


export { addToCart, updateCart, getUserCart }