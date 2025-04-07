import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { backend_url } from "../App";

const EditProduct = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]); 
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [popular, setPopular] = useState(false);
  const [image, setImage] = useState(null);
  const [previewImg, setPreviewImg] = useState("");
  const [publisher, setPublisher] = useState(""); 

  const fetchProductById = async () => {
    try {
      const response = await axios.post(
        `${backend_url}/api/product/single`,
        { productId: id }
      );
      if (response.data.success) {
        const p = response.data.product;
        setName(p.name);
        setCategory(p.category);
        setDescription(p.description);
        setAuthor(p.author);
        setQuantity(p.quantity);
        setPrice(p.price);
        setPopular(p.popular);
        setPublisher(p.publisher); 
        setPreviewImg(p.image);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/category/list`);
      if (response.data.success) {
        setCategories(response.data.categories);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Không thể lấy danh sách thể loại!");
    }
  };

  useEffect(() => {
    fetchProductById();
    fetchCategories(); 
  }, [id]);

  const handleSubmit = async () => {
    if (!name || !category || !description || !price || !publisher) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("author", author);
      formData.append("quantity", quantity);
      formData.append("price", price);
      formData.append("popular", popular);
      formData.append("publisher", publisher);
      if (image) {
        formData.append("image", image);
      }

      const response = await axios.put(
        `${backend_url}/api/product/update/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreviewImage(file);
  };

  const setPreviewImage = (file) => {
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

  return (
    <div className="flex justify-center p-6">
      <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">Chỉnh sửa thông tin sách</h2>

        {previewImg && (
          <img
            src={previewImg}
            alt="Preview"
            className="w-48 h-48 object-cover mb-6 rounded-md border border-gray-300"
          />
        )}

        <div className="mb-6">
          <label className="block text-gray-600 font-medium">Tên sách</label>
          <input
            type="text"
            className="border p-4 w-full mt-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên sách..."
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-600 font-medium">Thể loại</label>
          <select
            className="border p-4 w-full mt-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Chọn thể loại</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-gray-600 font-medium">Mô tả</label>
          <textarea
            className="border p-4 w-full mt-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả..."
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-600 font-medium">Tác giả</label>
          <input
            type="text"
            className="border p-4 w-full mt-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Tác giả..."
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-600 font-medium">Nhà xuất bản</label>
          <input
            type="text"
            className="border p-4 w-full mt-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}  
            placeholder="Nhà xuất bản..."
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-600 font-medium">Số lượng</label>
          <input
            type="number"
            className="border p-4 w-full mt-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Số lượng..."
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-600 font-medium">Giá</label>
          <input
            type="number"
            className="border p-4 w-full mt-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Giá..."
          />
        </div>

        <div className="mb-6 flex items-center gap-2">
          <input
            type="checkbox"
            checked={popular}
            onChange={() => setPopular(!popular)}
            className="h-5 w-5"
          />
          <label className="text-gray-600">Sách phổ biến</label>
        </div>

        <div className="mb-6">
          <label className="block text-gray-600 font-medium">Hình ảnh sách</label>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className="border p-4 w-full mt-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out w-full"
        >
          Cập nhật
        </button>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition ml-2"
        >
          Trở về
        </button>
      </div>
    </div>
  );
};

export default EditProduct;
