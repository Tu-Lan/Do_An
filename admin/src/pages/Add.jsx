import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backend_url } from "../App.jsx";
import upload_icon from "../assets/upload_icon.png";

const Add = ({ token }) => {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState(""); 
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [popular, setPopular] = useState(false);
  const [categories, setCategories] = useState([]);

  const handleChangeImage = (e) => {
    setImage(e.target.files[0]);
  };

  useEffect(() => {
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
        console.error("Error fetching categories:", error);
        toast.error(error.response?.data?.message || "Lỗi khi lấy danh sách danh mục.");
      }
    };

    fetchCategories();
  }, [backend_url, token]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("author", author);
      formData.append("publisher", publisher); 
      formData.append("price", price);
      formData.append("quantity", quantity);
      formData.append("category", category);
      formData.append("popular", popular);
      formData.append("image", image);

      const response = await axios.post(`${backend_url}/api/product/stock/add`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setDescription("");
        setAuthor("");
        setPublisher("");
        setQuantity("");
        setPrice("");
        setImage(null);
        setPopular(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log("Lỗi khi thêm sản phẩm:", error.response?.data);
      toast.error(error.message);
    }
  };

  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Thêm sách mới</h2>
      <form onSubmit={onSubmitHandler} className="flex flex-col gap-y-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-semibold text-gray-700">Tên sách</label>
          <input
            id="name"
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Tên sách..."
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="author" className="text-sm font-semibold text-gray-700">Tác giả</label>
          <input
            id="author"
            onChange={(e) => setAuthor(e.target.value)}
            value={author}
            type="text"
            placeholder="Tác giả..."
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="publisher" className="text-sm font-semibold text-gray-700">Nhà xuất bản</label>
          <input
            id="publisher"
            onChange={(e) => setPublisher(e.target.value)}
            value={publisher}
            type="text"
            placeholder="Nhà xuất bản..."
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Giá</label>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            type="number"
            min="0"
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Số lượng</label>
          <input
            onChange={(e) => setQuantity(e.target.value)}
            value={quantity}
            type="number"
            min="1"
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Thể loại</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-4 rounded-md"
          >
            <option value="">Chọn thể loại</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-center">
          <label className="cursor-pointer">
            <img
              src={image ? URL.createObjectURL(image) : upload_icon}
              alt="Upload Icon"
              className="w-20 h-20 object-cover border rounded-md"
            />
            <input type="file" onChange={handleChangeImage} hidden />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={popular}
            onChange={() => setPopular(!popular)}
            className="h-4 w-4"
          />
          <label className="text-sm font-semibold">Sách phổ biến</label>
        </div>

        <button
          type="submit"
          className="self-start px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
        >
          Thêm sách
        </button>
      </form>
    </div>
  );
};

export default Add;