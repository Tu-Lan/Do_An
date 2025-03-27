// admin/src/pages/EditCategory.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { backend_url } from "../App";

const EditCategory = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [previewImg, setPreviewImg] = useState("");

  const fetchCategory = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/category/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const category = response.data.categories.find(cat => cat._id === id);
        if (category) {
          setName(category.name);
          setPreviewImg(category.image);
        } else {
          toast.error("Không tìm thấy thể loại");
          navigate("/list-category");
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching category:", error);
      toast.error(error.response?.data?.message || 'An error occurred while fetching category.');
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImg(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImg("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.error("Vui lòng nhập tên thể loại.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (image) {
        formData.append("image", image);
      }

      const response = await axios.put(`${backend_url}/api/category/update/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/list-category");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(error.response?.data?.message || 'An error occurred while updating category.');
    }
  };

  return (
    <div className="flex justify-center p-6">
      <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">Chỉnh sửa thể loại</h2>
        {previewImg && (
          <img
            src={previewImg}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-full mb-4"
          />
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-semibold text-gray-700">Tên thể loại</label>
            <input
              id="name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              placeholder="Nhập tên thể loại..."
              className="border p-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="image" className="text-sm font-semibold text-gray-700">Tải hình ảnh</label>
            <input
              id="image"
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="border p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out w-full"
          >
            Cập nhật thể loại
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition ml-2"
          >
            Trở về
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditCategory;