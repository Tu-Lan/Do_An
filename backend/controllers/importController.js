import importModel from '../models/importModel.js';
import stockModel from '../models/stockModel.js';
import cloudinary from 'cloudinary';

const getImportList = async (req, res) => {
  try {
    const imports = await importModel.find({}).sort({ importDate: -1 }); 
    res.status(200).json({ success: true, imports });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phiếu nhập:", error);
    res.status(500).json({ success: false, message: "Lỗi server.", error: error.message });
  }
};

const updateImport = async (req, res) => {
  try {
    const { id } = req.params; 
    const { name, author, publisher, price, quantity } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "ID phiếu nhập là bắt buộc." });
    }

    const missingFields = [];
    if (!name) missingFields.push("Tên sách (name)");
    if (!author) missingFields.push("Tác giả (author)");
    if (!publisher) missingFields.push("Nhà xuất bản (publisher)");
    if (!price) missingFields.push("Giá (price)");
    if (!quantity) missingFields.push("Số lượng (quantity)");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Các trường sau cần được nhập: ${missingFields.join(", ")}.`,
      });
    }

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ success: false, message: "Giá phải lớn hơn 0." });
    }

    const importItem = await importModel.findById(id);
    if (!importItem) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phiếu nhập." });
    }

    const stockItem = await stockModel.findById(importItem.stockItemId);
    if (!stockItem) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm trong kho." });
    }

    const oldQuantity = importItem.quantity;

    let imageUrl = importItem.image;
    if (req.file) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
        imageUrl = uploadResult.secure_url;
      } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi tải hình ảnh.", error: error.message });
      }
    }

    importItem.name = name; 
    importItem.author = author; 
    importItem.publisher = publisher;
    importItem.price = Number(price); 
    importItem.quantity = Number(quantity); 
    importItem.image = imageUrl; 
    await importItem.save();

    stockItem.name = name; 
    stockItem.author = author; 
    stockItem.publisher = publisher; 
    stockItem.price = Number(price); 
    stockItem.image = imageUrl; 

    const quantityDifference = Number(quantity) - oldQuantity; 
    stockItem.quantity += quantityDifference; 

    if (stockItem.quantity < 0) {
      return res.status(400).json({ success: false, message: "Số lượng trong kho không thể nhỏ hơn 0." });
    }

    await stockItem.save();

    res.status(200).json({
      success: true,
      message: "Phiếu nhập và sản phẩm trong kho đã được cập nhật thành công.",
      import: importItem,
      stock: stockItem,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật phiếu nhập:", error);
    res.status(500).json({ success: false, message: "Lỗi server.", error: error.message });
  }
};

const deleteImport = async (req, res) => {
  try {
    const { id } = req.params; 

    if (!id) {
      return res.status(400).json({ success: false, message: "ID phiếu nhập là bắt buộc." });
    }

    const importItem = await importModel.findById(id);
    if (!importItem) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phiếu nhập." });
    }

    if (importItem.isDeleted) {
      return res.status(400).json({ success: false, message: "Phiếu nhập đã được chuyển vào thùng rác." });
    }

    importItem.isDeleted = true;
    importItem.deletedAt = new Date();
    await importItem.save();

    res.status(200).json({
      success: true,
      message: "Phiếu nhập đã được chuyển vào thùng rác. Sẽ xóa hẳn sau 30 ngày.",
      import: importItem,
    });
  } catch (error) {
    console.error("Lỗi khi xóa phiếu nhập:", error);
    res.status(500).json({ success: false, message: "Lỗi server.", error: error.message });
  }
};


const restoreImport = async (req, res) => {
  try {
    const { id } = req.params; 

    if (!id) {
      return res.status(400).json({ success: false, message: "ID phiếu nhập là bắt buộc." });
    }

    const importItem = await importModel.findById(id);
    if (!importItem) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phiếu nhập." });
    }

    if (!importItem.isDeleted) {
      return res.status(400).json({ success: false, message: "Phiếu nhập không nằm trong thùng rác." });
    }

    importItem.isDeleted = false;
    importItem.deletedAt = null;
    await importItem.save();

    res.status(200).json({
      success: true,
      message: "Phiếu nhập đã được khôi phục thành công.",
      import: importItem,
    });
  } catch (error) {
    console.error("Lỗi khi khôi phục phiếu nhập:", error);
    res.status(500).json({ success: false, message: "Lỗi server.", error: error.message });
  }
};

const permanentlyDeleteImport = async (req, res) => {
  try {
    const { id } = req.params; 

    if (!id) {
      return res.status(400).json({ success: false, message: "ID phiếu nhập là bắt buộc." });
    }

    const importItem = await importModel.findById(id);
    if (!importItem) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phiếu nhập." });
    }

    if (!importItem.isDeleted) {
      return res.status(400).json({ success: false, message: "Phiếu nhập không nằm trong thùng rác." });
    }

    await importModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Phiếu nhập đã được xóa hẳn thành công.",
    });
  } catch (error) {
    console.error("Lỗi khi xóa hẳn phiếu nhập:", error);
    res.status(500).json({ success: false, message: "Lỗi server.", error: error.message });
  }
};

export { restoreImport, permanentlyDeleteImport };

export { getImportList , updateImport, deleteImport};