import categoryModel from '../models/categoryModel.js';
import cloudinary from '../config/cloudinary.js';

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Tên thể loại là bắt buộc.' });
    }

    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(409).json({ success: false, message: 'Thể loại này đã tồn tại.' });
    }

    let imageUrl = 'https://via.placeholder.com/150';

    if (req.file) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: 'categories' });
        imageUrl = uploadResult.secure_url;
      } catch (error) {
        return res.status(500).json({ success: false, message: 'Tải hình ảnh bị lỗi.', error: error.message });
      }
    }

    const category = new categoryModel({
      name,
      image: imageUrl,
    });

    await category.save();

    res.status(201).json({ success: true, message: 'Đã thêm thể loại thành công.', category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find().sort({ name: 1 }); // Sắp xếp theo tên
    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
  }
};
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Tên thể loại sách là bắt buộc.' });
    }

    const category = await categoryModel.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thể loại sách.' });
    }

    if (name) category.name = name;

    if (req.file) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: 'categories' });
        category.image = uploadResult.secure_url;
      } catch (error) {
        return res.status(500).json({ success: false, message: 'Tải hình ảnh bị lỗi.', error: error.message });
      }
    }

    await category.save();

    res.status(200).json({ success: true, message: 'Thể loại được cập nhật.', category });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Thể loại sách là bắt buộc.' });
    }

    const category = await categoryModel.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thể loại sách.' });
    }

    res.status(200).json({ success: true, message: 'Đã xóa thể loại thành công.' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
  }
};

export { createCategory, getCategories, updateCategory, deleteCategory };