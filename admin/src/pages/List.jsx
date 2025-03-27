import axios from "axios";
import { useState, useEffect } from "react";
import { backend_url, currency } from "../App";
import { toast } from "react-toastify";
import { TbTrash } from "react-icons/tb";
import { TbEdit } from "react-icons/tb"; 
import { useNavigate } from "react-router-dom";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]); 
  const [search, setSearch] = useState(""); 
  const navigate = useNavigate();

  const fetchList = async () => {
    try {
      const response = await axios.get(backend_url + "/api/product/list");
      if (response.data.success) {
        setList(response.data.products);
        setFilteredList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.delete(`${backend_url}/api/product/delete`, {
        data: { id },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    const filtered = list.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredList(filtered);
  }, [search, list]);

  return (
    <div className="px-2 sm:px-8 mt-4 sm:mt-14">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Danh sách sách</h2>

      {/* Thanh tìm kiếm */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr] md:grid-cols-[1fr_3.5fr_2fr_2fr_2fr_2fr_2fr_2fr] items-center py-1 px-2 bg-white bold-14 sm:bold-15 mb-1 rounded">
          <h5>Hình ảnh</h5>
          <h5>Tên sách</h5>
          <h5>Thể loại</h5>
          <h5>Giá</h5>
          <h5>Số lượng</h5>
          <h5>Xóa</h5>
          <h5>Sửa</h5>
        </div>

        {/* Product List */}
        {filteredList.length === 0 ? (
          <div className="text-center py-4">
            <h5 className="text-lg font-semibold">
              Không tìm thấy sản phẩm nào phù hợp.
            </h5>
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item._id}
              className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr] md:grid-cols-[1fr_3.5fr_2fr_2fr_2fr_2fr_2fr_2fr] items-center gap-2 p-1 bg-white rounded-xl"
            >
              <img src={item.image} alt="img" className="w-12 rounded-lg" />
              <h5 className="text-sm font-semibold">{item.name}</h5>
              <p className="font-semibold">{item.category}</p>
              <div className="text-sm font-semibold">
                {item.price}
                {currency}
              </div>

              {/* Hiển thị thông báo số lượng */}
              <div className="text-sm font-semibold">
                {item.quantity === 0 ? (
                  <span className="text-red-500">Hết hàng ({item.quantity}/{item.totalQuantity})</span>
                ) : item.quantity < 10 ? (
                  <span className="text-yellow-500">
                    Sắp hết hàng ({item.quantity}/{item.totalQuantity})
                  </span>
                ) : (
                  <span>{item.quantity}/{item.totalQuantity}</span>
                )}
              </div>

              {/* Nút xóa */}
              <div>
                <TbTrash
                  onClick={() => removeProduct(item._id)}
                  className="cursor-pointer text-lg text-red-500"
                />
              </div>

              {/* Nút edit */}
              <div>
                <TbEdit
                  onClick={() => navigate(`/edit-product/${item._id}`)}
                  className="cursor-pointer text-lg text-blue-500"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default List;
