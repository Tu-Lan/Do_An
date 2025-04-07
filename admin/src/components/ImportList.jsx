import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backend_url } from "../App.jsx";
import { useLocation } from "react-router-dom";

const ImportList = ({ token }) => {
  const [imports, setImports] = useState([]);
  const [trashImports, setTrashImports] = useState([]);
  const [editingImport, setEditingImport] = useState(null);
  const [formData, setFormData] = useState({ name: "", author: "", publisher: "", price: "", quantity: "", image: null });
  const [showTrash, setShowTrash] = useState(false);
  const location = useLocation();

  const fetchImports = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/import/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setImports(response.data.imports.filter(item => !item.isDeleted));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lấy danh sách phiếu nhập.");
    }
  };

  const fetchTrashImports = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/product/trash`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setTrashImports(response.data.imports);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lấy danh sách thùng rác.");
    }
  };

  useEffect(() => {
    fetchImports();
    fetchTrashImports();
    const newImport = location.state?.newImport;
    if (newImport) {
      setImports((prevImports) => [newImport, ...prevImports]);
    }
  }, [location.state, token]);

  const handleEdit = (importItem) => {
    setEditingImport(importItem._id);
    setFormData({
      name: importItem.name,
      author: importItem.author,
      publisher: importItem.publisher,
      price: importItem.price,
      quantity: importItem.quantity,
      image: null,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { name, author, publisher, price, quantity } = formData;
    const missingFields = [];
    if (!name) missingFields.push("Tên sách");
    if (!author) missingFields.push("Tác giả");
    if (!publisher) missingFields.push("Nhà xuất bản");
    if (!price) missingFields.push("Giá");
    if (!quantity) missingFields.push("Số lượng");

    if (missingFields.length > 0) {
      toast.error(`Vui lòng điền: ${missingFields.join(", ")}.`);
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("author", formData.author);
      data.append("publisher", formData.publisher);
      data.append("price", formData.price);
      data.append("quantity", formData.quantity);
      if (formData.image) data.append("image", formData.image);

      const response = await axios.put(`${backend_url}/api/import/${editingImport}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setImports((prev) =>
          prev.map((item) =>
            item._id === editingImport ? response.data.import : item
          )
        );
        setEditingImport(null);
        setFormData({ name: "", author: "", publisher: "", price: "", quantity: "", image: null });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật phiếu nhập.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phiếu nhập này? Nó sẽ được chuyển vào thùng rác.")) return;

    try {
      const response = await axios.delete(`${backend_url}/api/import/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setImports((prev) => prev.filter((item) => item._id !== id));
        setTrashImports((prev) => [response.data.import, ...prev]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa phiếu nhập.");
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("Bạn có chắc muốn khôi phục phiếu nhập này?")) return;

    try {
      const response = await axios.post(`${backend_url}/api/import/restore/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setTrashImports((prev) => prev.filter((item) => item._id !== id));
        setImports((prev) => [response.data.import, ...prev]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi khôi phục phiếu nhập.");
    }
  };

  const handlePermanentlyDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa hẳn phiếu nhập này? Hành động này không thể hoàn tác.")) return;

    try {
      const response = await axios.delete(`${backend_url}/api/import/permanent/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setTrashImports((prev) => prev.filter((item) => item._id !== id));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa hẳn phiếu nhập.");
    }
  };

  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        {showTrash ? "🗑️ Thùng rác phiếu nhập" : "📦 Danh sách phiếu nhập"}
      </h2>
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowTrash(!showTrash)}
          className="px-5 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
        >
          {showTrash ? "⬅️ Quay lại danh sách" : "🗑️ Xem thùng rác"}
        </button>
      </div>

      {showTrash ? (
        trashImports.length === 0 ? (
          <p className="text-gray-600 text-center">Thùng rác trống.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trashImports.map((importItem) => (
              <div
                key={importItem._id}
                className="bg-white border rounded-xl p-4 shadow-md hover:shadow-lg transition"
              >
                <img
                  src={importItem.image || "https://via.placeholder.com/150"}
                  alt={importItem.name}
                  className="w-full h-40 object-cover mb-4 rounded-md"
                />
                <h3 className="text-lg font-bold text-gray-800">{importItem.name}</h3>
                <p className="text-sm text-gray-600">Tác giả: {importItem.author}</p>
                <p className="text-sm text-gray-600">NXB: {importItem.publisher}</p>
                <p className="text-sm text-gray-600">Giá: {importItem.price} VNĐ</p>
                <p className="text-sm text-gray-600">SL: {importItem.quantity}</p>
                <p className="text-xs text-gray-500 mt-1">🗓️ Xóa: {new Date(importItem.deletedAt).toLocaleDateString()}</p>
                <div className="flex gap-2 mt-4 justify-end">
                  <button
                    onClick={() => handleRestore(importItem._id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    Khôi phục
                  </button>
                  <button
                    onClick={() => handlePermanentlyDelete(importItem._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Xóa hẳn
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : imports.length === 0 ? (
        <p className="text-gray-600 text-center">Chưa có phiếu nhập nào.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {imports.map((importItem) => (
            <div key={importItem._id} className="bg-white border rounded-xl p-5 shadow-md hover:shadow-lg transition">
              {editingImport === importItem._id ? (
                <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-indigo-700 mb-2">Chỉnh sửa phiếu nhập</h3>
                  {importItem.image && (
                    <div className="mb-2">
                      <img
                        src={importItem.image}
                        alt={formData.name}
                        className="w-32 h-32 object-cover rounded-md mx-auto border"
                      />
                    </div>
                  )}

                  <label htmlFor="name" className="text-sm font-semibold text-gray-700">Tên sách</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Tên sách"
                    className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />

                  <label htmlFor="author" className="text-sm font-semibold text-gray-700">Tác giả</label>
                  <input
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder="Tác giả"
                    className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />

                  <label htmlFor="publisher" className="text-sm font-semibold text-gray-700">Nhà xuất bản</label>
                  <input
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleInputChange}
                    placeholder="Nhà xuất bản"
                    className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />

                  <label htmlFor="price" className="text-sm font-semibold text-gray-700">Giá</label>
                  <input
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Giá"
                    className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />

                  <label htmlFor="quantity" className="text-sm font-semibold text-gray-700">Số lượng</label>
                  <input
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="Số lượng"
                    className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />

                  <label htmlFor="image" className="text-sm font-semibold text-gray-700">Cập nhật hình ảnh (nếu muốn)</label>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    className="text-sm"
                  />

                  <div className="flex gap-3 mt-4">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingImport(null)}
                      className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <img
                    src={importItem.image || "https://via.placeholder.com/150"}
                    alt={importItem.name}
                    className="w-full h-40 object-cover mb-4 rounded-md"
                  />
                  <h3 className="text-lg font-bold text-gray-800">{importItem.name}</h3>
                  <p className="text-sm text-gray-600">Tác giả: {importItem.author}</p>
                  <p className="text-sm text-gray-600">NXB: {importItem.publisher}</p>
                  <p className="text-sm text-gray-600">Giá: {importItem.price} VNĐ</p>
                  <p className="text-sm text-gray-600">SL: {importItem.quantity}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    🗓️ Nhập: {new Date(importItem.importDate).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 mt-4 justify-end">
                    <button
                      onClick={() => handleEdit(importItem)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(importItem._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

};

export default ImportList;