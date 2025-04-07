import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backend_url } from "../App.jsx";
import upload_icon from "../assets/upload_icon.png";
import { useNavigate } from "react-router-dom"; 

const Add = ({ token }) => {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [price, setPrice] = useState("");
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate(); 

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
        toast.error(error.response?.data?.message || "Lỗi khi lấy danh sách danh mục.");
      }
    };
    fetchCategories();
  }, [token]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("author", author);
      formData.append("publisher", publisher);
      formData.append("price", price);
      formData.append("quantity", quantity);
      if (image) formData.append("image", image);

      const response = await axios.post(`${backend_url}/api/product/stock/add`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setAuthor("");
        setPublisher("");
        setPrice("");
        setQuantity(1);
        setImage(null);

        navigate("/import-list", { state: { newImport: response.data.importTicket } });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      toast.error(error.response?.data?.message || "Lỗi khi thêm sản phẩm.");
    }
  };

  const handleChangeImage = (e) => {
    setImage(e.target.files[0]);
  };

  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Thêm sách vào kho</h2>
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

        <button
          type="submit"
          className="self-start px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
        >
          Thêm vào kho
        </button>
      </form>
    </div>
  );
};

export default Add;