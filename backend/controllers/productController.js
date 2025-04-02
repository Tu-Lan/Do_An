import cloudinary from 'cloudinary';
import productModel from '../models/productModel.js';
import stockModel from '../models/stockModel.js';
import orderModel from '../models/orderModel.js';

const createProduct = async (req, res) => {
  try {
    const { name, description, author, category, price, popular, quantity } = req.body;

    if (!name || !description || !category || !price) {
      return res.status(400).json({ success: false, message: "Tất cả các trường cần được nhập." });
    }

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ success: false, message: "Giá sách phải lớn hơn 0." });
    }

    let imageUrl = "https://via.placeholder.com/150"; // Default image

    // Handle file upload
    if (req.file) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
        imageUrl = uploadResult.secure_url;
      } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi tải hình ảnh.", error: error.message });
      }
    }

    // Construct product data
    const initialQuantity = Number(quantity) || 0;
    const productData = {
      name,
      description,
      author,
      category,
      price: Number(price),
      popular: popular === "true" ? true : false,
      quantity: initialQuantity,
      totalQuantity: initialQuantity, // Initialize totalQuantity with initial quantity
      image: imageUrl,
      date: new Date(),
    };

    // Save product to database
    const product = new productModel(productData);
    await product.save();

    res.status(201).json({ success: true, message: "Đã thêm sách thành công.", product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
  }
};

const addToStock = async (req, res) => {
  try {
    const { name, author, publisher, price, quantity } = req.body;

    if (!name || !author || !publisher || !price || !quantity) {
      return res.status(400).json({ success: false, message: "Tất cả các trường cần được nhập." });
    }

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ success: false, message: "Giá phải lớn hơn 0." });
    }

    let imageUrl = "https://via.placeholder.com/150"; // Ảnh mặc định

    // Xử lý upload ảnh lên Cloudinary
    if (req.file) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
        imageUrl = uploadResult.secure_url;
      } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi tải hình ảnh.", error: error.message });
      }
    }

    // Kiểm tra nếu sản phẩm đã có trong kho
    let stockItem = await stockModel.findOne({ name, author });

    if (stockItem) {
      // Nếu sản phẩm đã có, cập nhật số lượng
      stockItem.quantity += Number(quantity);
      await stockItem.save();
      return res.status(200).json({ success: true, message: "Sản phẩm đã có trong kho, số lượng đã được cập nhật.", stock: stockItem });
    } else {
      // Nếu sản phẩm chưa có, thêm mới
      stockItem = new stockModel({
        name,
        author,
        publisher, // Thêm publisher
        image: imageUrl,
        price: Number(price),
        quantity: Number(quantity),
      });
      await stockItem.save();
      return res.status(201).json({ success: true, message: "Sản phẩm đã được thêm vào kho.", stock: stockItem });
    }
  } catch (error) {
    console.error("Lỗi khi thêm vào kho:", error);
    res.status(500).json({ success: false, message: "Lỗi server.", error: error.message });
  }
};

const updateStockItem = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID sản phẩm từ URL
    const { name, author, publisher, price, quantity } = req.body;

    // Kiểm tra dữ liệu yêu cầu
    if (!name || !author || !publisher || !price || !quantity) {
      return res.status(400).json({ success: false, message: "Tất cả các trường cần được nhập." });
    }

    // Tìm sản phẩm trong kho
    const stockItem = await stockModel.findById(id);

    if (!stockItem) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm trong kho." });
    }

    // Cập nhật các thông tin sản phẩm
    stockItem.name = name || stockItem.name;
    stockItem.author = author || stockItem.author;
    stockItem.publisher = publisher || stockItem.publisher;
    stockItem.price = price || stockItem.price;
    stockItem.quantity = quantity || stockItem.quantity;

    await stockItem.save();

    res.status(200).json({ success: true, message: "Sản phẩm đã được cập nhật.", stock: stockItem });
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).json({ success: false, message: "Lỗi server.", error: error.message });
  }
};



const addProductForSale = async (req, res) => {
  try {
    const { name, description, author, category, quantity, popular, salePrice } = req.body;
    const requestedQuantity = Number(quantity);

    if (!name || !description || !category || !requestedQuantity) {
      return res.status(400).json({ success: false, message: "Tất cả các trường cần được nhập." });
    }

    // Kiểm tra xem sản phẩm đã tồn tại trong danh sách bán (products)
    const existingProduct = await productModel.findOne({ name, author });

    if (existingProduct) {
      // Nếu sản phẩm đã tồn tại, cập nhật số lượng
      existingProduct.quantity += requestedQuantity; // Cộng thêm số lượng
      existingProduct.totalQuantity += requestedQuantity; // Cộng thêm tổng số lượng

      // Nếu có giá mới (salePrice), cập nhật giá
      if (salePrice) {
        existingProduct.price = salePrice;
      }

      await existingProduct.save();
      return res.status(200).json({ success: true, message: "Sản phẩm đã tồn tại, số lượng đã được cập nhật.", product: existingProduct });
    }

    // Nếu sản phẩm chưa tồn tại trong danh sách bán, kiểm tra trong kho
    const stockItem = await stockModel.findOne({ name, author });

    if (!stockItem || stockItem.quantity < requestedQuantity) {
      return res.status(400).json({ success: false, message: "Không đủ số lượng trong kho để bán." });
    }

    let imageUrl = stockItem.image || "https://via.placeholder.com/150"; // Giữ ảnh từ kho
    const price = stockItem.price; // Lấy giá từ sản phẩm trong kho
    const publisher = stockItem.publisher; // Thêm publisher

    // Nếu có ảnh mới, upload lên Cloudinary
    if (req.file) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
        imageUrl = uploadResult.secure_url;
      } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi tải hình ảnh.", error: error.message });
      }
    }

    // Trừ số lượng trong kho
    stockItem.quantity -= requestedQuantity;
    await stockItem.save();

    // Sử dụng giá salePrice nếu có, nếu không thì dùng giá gốc từ kho
    const finalPrice = salePrice ? salePrice : price;

    // Thêm vào danh sách sản phẩm để bán
    const newProduct = new productModel({
      name,
      description,
      author,
      category,
      price: finalPrice, // Sử dụng giá mới (salePrice)
      quantity: requestedQuantity,
      totalQuantity: requestedQuantity,
      image: imageUrl,
      date: new Date(),
      popular: popular === "true" ? true : false,
      publisher, // Thêm publisher
    });

    await newProduct.save();

    res.status(201).json({ success: true, message: "Sản phẩm đã sẵn sàng để bán.", product: newProduct });
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm bán:", error);
    res.status(500).json({ success: false, message: "Lỗi server.", error: error.message });
  }
};



const getStockList = async (req, res) => {
  try {
    const stock = await stockModel.find({});
    res.status(200).json({ success: true, stock });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách kho:", error);
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
};
const deleteStockItem = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Cần cung cấp ID sản phẩm." });
    }

    const deletedStock = await stockModel.findByIdAndDelete(id);

    if (!deletedStock) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm trong kho." });
    }

    res.status(200).json({ success: true, message: "Đã xoá sản phẩm khỏi kho." });
  } catch (error) {
    console.error("Lỗi khi xoá sản phẩm khỏi kho:", error);
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
};
const getSaleProductList = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sách có thể bán:", error);
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;

    // Validate ID
    if (!id) {
      return res.status(400).json({ success: false, message: "Mã sách là bắt buộc." });
    }

    const product = await productModel.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sách." });
    }

    res.json({ success: true, message: "Đã xóa sách thành công." });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
  }
};

const getAllProduct = async (req, res) => {
  try {
    const { category } = req.query;

    // Optional filter by category
    const filter = category ? { category } : {};
    const products = await productModel.find(filter);

    res.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
  }
};

const getProductById = async (req, res) => {
  const { productId } = req.body; // Get ID from URL parameters
  try {
    // Validate ID
    if (!productId) {
      return res.status(400).json({ success: false, message: "Mã sách là bắt buộc." });
    }

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sách." });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
  }
};

// Cập nhật thông tin sản phẩm
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID sản phẩm từ URL
    const { name, description, author, category, price, popular, quantity, publisher } = req.body; // Các trường cần cập nhật

    // Kiểm tra ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Mã sách là bắt buộc.'
      });
    }

    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách.'
      });
    }

    // Cập nhật các thông tin sản phẩm
    product.name = name || product.name;
    product.author = author || product.author;
    product.publisher = publisher || product.publisher; // Cập nhật nhà sản xuất
    product.category = category || product.category;
    product.price = price || product.price;
    product.quantity = quantity || product.quantity;

    if (price) {
      if (isNaN(price) || price <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Giá sách phải lớn hơn 0.'
        });
      }
      product.price = Number(price);
    }

    if (popular !== undefined) {
      product.popular = popular === 'true' || popular === true;
    }

    if (req.file) {
      try {
        const uploadResult = await cloudinary.v2.uploader.upload(req.file.path, {
          resource_type: 'image'
        });
        product.image = uploadResult.secure_url;
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Lỗi tải hình ảnh.',
          error: error.message
        });
      }
    }

    if (quantity !== undefined) {
      console.log('Old quantity:', product.quantity);
      console.log('Old total quantity:', product.totalQuantity);

      const oldQuantity = product.quantity || 0;
      const newQuantity = Number(quantity);

      // Nếu là lần đầu cập nhật hoặc totalQuantity chưa được set
      if (!product.totalQuantity) {
        product.totalQuantity = newQuantity;
      } else {
        // Nếu số lượng mới lớn hơn số lượng cũ, cộng thêm phần chênh lệch vào tổng
        if (newQuantity > oldQuantity) {
          product.totalQuantity += (newQuantity - oldQuantity);
        }
      }

      // Cập nhật số lượng hiện tại
      product.quantity = newQuantity;

      console.log('New quantity:', product.quantity);
      console.log('New total quantity:', product.totalQuantity);
    }

    const updatedProduct = await product.save();
    return res.status(200).json({
      success: true,
      message: 'Cập nhật sách thành công!!.',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: error.message
    });
  }
};

const getProductSalesStats = async (req, res) => {
  try {
    const stats = await orderModel.aggregate([
      { $unwind: "$items" }, // Decompose the items array into individual documents
      {
        $group: {
          _id: "$items._id", // Group by product ID
          name: { $first: "$items.name" }, // Get the product name
          image: { $first: "$items.image" }, // Get the product image
          totalSold: { $sum: "$items.quantity" }, // Sum the quantities sold
        },
      },
      { $sort: { totalSold: -1 } }, // Sort by total sold in descending order
    ]);

    const totalProductsSold = stats.reduce((sum, product) => sum + product.totalSold, 0);

    res.status(200).json({ success: true, stats, totalProductsSold });
  } catch (error) {
    console.error("Error fetching product sales stats:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export { createProduct, deleteProduct, getAllProduct, updateStockItem, getSaleProductList, getProductById, updateProduct, addToStock, addProductForSale, getStockList, deleteStockItem, getProductSalesStats };
