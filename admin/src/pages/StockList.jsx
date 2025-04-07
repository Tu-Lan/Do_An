import { useEffect, useState } from "react";
import axios from "axios";
import { backend_url } from "../App.jsx";
import { toast } from "react-toastify";
import { TbTrash } from "react-icons/tb";
import { FaEdit, FaShoppingCart } from "react-icons/fa";

const StockList = ({ token }) => {
  const [stock, setStock] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [updatedDetails, setUpdatedDetails] = useState({
    name: "",
    author: "",
    publisher: "",
    price: "",
    quantity: "",
  });
  const [saleDetails, setSaleDetails] = useState({
    description: "",
    category: "",
    quantity: 1,
    salePrice: "",
    popular: false,
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);

  useEffect(() => {
    fetchStock();
    fetchCategories();
  }, []);

  const fetchStock = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/product/stock/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setStock(response.data.stock);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách kho:", error);
      toast.error("Lỗi khi lấy danh sách kho.");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/category/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setCategories(response.data.categories);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thể loại:", error);
      toast.error("Lỗi khi lấy danh sách thể loại.");
    }
  };

  const openEditModal = (stockItem) => {
    setSelectedStock(stockItem);
    setUpdatedDetails({
      name: stockItem.name,
      author: stockItem.author,
      publisher: stockItem.publisher,
      price: stockItem.price,
      quantity: stockItem.quantity,
    });
    setIsEditModalOpen(true);
    setIsSaleModalOpen(false);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedStock(null);
    setUpdatedDetails({
      name: "",
      author: "",
      publisher: "",
      price: "",
      quantity: "",
    });
  };

  const handleUpdateStockItem = async () => {
    try {
      const { name, author, publisher, price, quantity } = updatedDetails;

      if (!name || !author || !publisher || !price || !quantity) {
        toast.error("Tất cả các trường cần được nhập.");
        return;
      }

      const updatedProduct = { name, author, publisher, price, quantity };

      const response = await axios.put(`${backend_url}/api/product/stock/update/${selectedStock._id}`, updatedProduct, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success("Thông tin sản phẩm đã được cập nhật!");
        fetchStock();
        closeEditModal();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      toast.error("Không thể cập nhật thông tin sản phẩm.");
    }
  };
  const deleteStockItem = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá sản phẩm này khỏi kho?")) return;

    try {
      const response = await axios.delete(`${backend_url}/api/product/stock/delete`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { id },
      });

      if (response.data.success) {
        toast.success("Đã xoá sản phẩm khỏi kho.");
        setStock(stock.filter(item => item._id !== id));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi xoá sản phẩm:", error);
      toast.error("Không thể xoá sản phẩm.");
    }
  };

  const openSellModal = (stockItem) => {
    setSelectedStock(stockItem);
    setSaleDetails({ ...saleDetails, quantity: 1 });
    setIsSaleModalOpen(true);
    setIsEditModalOpen(false); 
  };

  const closeSellModal = () => {
    setIsSaleModalOpen(false);
    setSelectedStock(null);
    setSaleDetails({
      description: "",
      category: "",
      quantity: 1,
      salePrice: "",
      popular: false,
    });
  };

  const handleSellProduct = async () => {
    if (!selectedStock) return;

    if (saleDetails.quantity < 1 || saleDetails.quantity > selectedStock.quantity) {
      toast.error("Số lượng không hợp lệ.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", selectedStock.name);
      formData.append("description", saleDetails.description);
      formData.append("author", selectedStock.author);
      formData.append("category", saleDetails.category);
      formData.append("quantity", saleDetails.quantity);
      formData.append("publisher", selectedStock.publisher);
      formData.append("popular", saleDetails.popular);
      formData.append("salePrice", saleDetails.salePrice);

      const response = await axios.post(`${backend_url}/api/product/sale/add`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success("Sản phẩm đã được thêm vào danh sách bán!");
        fetchStock();
        closeSellModal();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi bán sản phẩm:", error.response?.data);
      toast.error("Không thể bán sản phẩm.");
    }
  };

  return (
    <div className="px-4 py-8">
      <h2 className="text-xl font-bold mb-4">Danh sách sách trong kho</h2>

      {stock.length === 0 ? (
        <p className="text-gray-500">Không có sách nào trong kho.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-3 px-6 text-left">Ảnh</th>
                <th className="py-3 px-6 text-left">Tên sách</th>
                <th className="py-3 px-6 text-left">Tác giả</th>
                <th className="py-3 px-6 text-left">Nhà xuất bản</th>
                <th className="py-3 px-6 text-left">Giá</th>
                <th className="py-3 px-6 text-left">Số lượng</th>
                <th className="py-3 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((item) => (
                <tr key={item._id} className="border-b hover:bg-gray-100">
                  <td className="py-2 px-6">
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-md" />
                  </td>
                  <td className="py-2 px-6">{item.name}</td>
                  <td className="py-2 px-6">{item.author}</td>
                  <td className="py-2 px-6">{item.publisher}</td>
                  <td className="py-2 px-6">{item.price}₫</td>
                  <td className="py-2 px-6">{item.quantity}</td>
                  <td className="py-2 px-6 text-center">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      <FaEdit size={20} />
                    </button>
                    <button
                      onClick={() => deleteStockItem(item._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TbTrash size={20} />
                    </button>
                    <button
                      onClick={() => openSellModal(item)}
                      className="text-green-600 hover:text-green-800 mr-2"
                    >
                      <FaShoppingCart size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isEditModalOpen && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Chỉnh sửa sản phẩm: {selectedStock.name}</h2>

            <label className="text-sm font-semibold">Tên sách</label>
            <input
              type="text"
              className="w-full border p-2 rounded-md mb-2"
              value={updatedDetails.name}
              onChange={(e) => setUpdatedDetails({ ...updatedDetails, name: e.target.value })}
            />

            <label className="text-sm font-semibold">Tác giả</label>
            <input
              type="text"
              className="w-full border p-2 rounded-md mb-2"
              value={updatedDetails.author}
              onChange={(e) => setUpdatedDetails({ ...updatedDetails, author: e.target.value })}
            />

            <label className="text-sm font-semibold">Nhà xuất bản</label>
            <input
              type="text"
              className="w-full border p-2 rounded-md mb-2"
              value={updatedDetails.publisher}
              onChange={(e) => setUpdatedDetails({ ...updatedDetails, publisher: e.target.value })}
            />

            <label className="text-sm font-semibold">Giá</label>
            <input
              type="number"
              className="w-full border p-2 rounded-md mb-2"
              value={updatedDetails.price}
              onChange={(e) => setUpdatedDetails({ ...updatedDetails, price: e.target.value })}
            />

            <label className="text-sm font-semibold">Số lượng</label>
            <input
              type="number"
              className="w-full border p-2 rounded-md mb-2"
              value={updatedDetails.quantity}
              onChange={(e) => setUpdatedDetails({ ...updatedDetails, quantity: e.target.value })}
            />

            <div className="flex justify-between mt-4">
              <button onClick={handleUpdateStockItem} className="bg-blue-600 text-white px-4 py-2 rounded-md">
                Cập nhật
              </button>
              <button onClick={closeEditModal} className="bg-red-600 text-white px-4 py-2 rounded-md">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {isSaleModalOpen && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Bán sách: {selectedStock.name}</h2>

            <label className="text-sm font-semibold">Mô tả</label>
            <textarea
              onChange={(e) => setSaleDetails({ ...saleDetails, description: e.target.value })}
              value={saleDetails.description}
              className="w-full border p-2 rounded-md mb-2"
            />

            <label className="text-sm font-semibold">Thể loại</label>
            <select
              onChange={(e) => setSaleDetails({ ...saleDetails, category: e.target.value })}
              value={saleDetails.category}
              className="w-full border p-2 rounded-md mb-2"
            >
              <option value="">Chọn thể loại</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            <label className="text-sm font-semibold">Số lượng</label>
            <input
              type="number"
              min="1"
              max={selectedStock.quantity}
              onChange={(e) => setSaleDetails({ ...saleDetails, quantity: e.target.value })}
              value={saleDetails.quantity}
              className="w-full border p-2 rounded-md mb-2"
            />

            <label className="text-sm font-semibold">Giá bán mới</label>
            <input
              type="number"
              onChange={(e) => setSaleDetails({ ...saleDetails, salePrice: e.target.value })}
              value={saleDetails.salePrice}
              className="w-full border p-2 rounded-md mb-2"
            />

            <div className="flex justify-between mt-4">
              <button onClick={handleSellProduct} className="bg-blue-600 text-white px-4 py-2 rounded-md">
                Xác nhận
              </button>
              <button onClick={closeSellModal} className="bg-red-600 text-white px-4 py-2 rounded-md">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockList;
