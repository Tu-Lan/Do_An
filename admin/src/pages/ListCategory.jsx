import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backend_url } from "../App";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ListCategory = ({ token }) => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/category/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setCategories(response.data.categories);
        setFilteredCategories(response.data.categories); 
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(
        error.response?.data?.message ||
        "An error occurred while fetching categories."
      );
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [search, categories]);

  const removeCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await axios.delete(
          `${backend_url}/api/category/delete/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.success) {
          toast.success(response.data.message);
          fetchCategories();
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error(
          error.response?.data?.message ||
          "An error occurred while deleting category."
        );
      }
    }
  };

  return (
    <div className="px-2 sm:px-8 mt-4 sm:mt-14">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Danh sách thể loại</h2>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm thể loại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
        />
      </div>

      <div className="grid grid-cols-[1fr_2fr_1fr_1fr] items-center py-1 px-2 bg-white bold-14 sm:bold-15 mb-1 rounded">
        <h5>Hình ảnh</h5>
        <h5>Tên thể loại</h5>
        <h5>Sửa</h5>
        <h5>Xóa</h5>
      </div>
      {filteredCategories.length === 0 ? (
        <div className="text-center py-4">
          <h5 className="text-lg font-semibold">
            Không tìm thấy thể loại nào phù hợp.
          </h5>
        </div>
      ) : (
        filteredCategories.map((category) => (
          <div
            key={category._id}
            className="grid grid-cols-[1fr_2fr_1fr_1fr] items-center gap-2 p-1 bg-white rounded-xl"
          >
            <img
              src={category.image}
              alt={category.name}
              className="w-12 h-12 object-cover rounded-lg"
            />
            <h5 className="text-sm font-semibold">{category.name}</h5>
            <div>
              <FaEdit
                onClick={() => navigate(`/edit-category/${category._id}`)}
                className="cursor-pointer text-lg text-blue-500"
              />
            </div>
            <div>
              <FaTrash
                onClick={() => removeCategory(category._id)}
                className="cursor-pointer text-lg text-red-500"
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ListCategory;
