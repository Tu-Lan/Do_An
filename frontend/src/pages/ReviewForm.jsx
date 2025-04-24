import { useParams, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";

const ReviewForm = () => {
  const { backend_url, token } = useContext(ShopContext);
  const { orderId } = useParams(); 
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState(""); 
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${backend_url}/api/review/add`, 
        { orderId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert("Cảm ơn bạn đã đánh giá!");
        navigate("/orders"); 
      } else {
        alert(res.data.message || "Không thể gửi đánh giá.");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi gửi đánh giá.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-28 p-5 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Đánh giá đơn hàng</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Số sao:</label>
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="mb-4 w-full border rounded px-2 py-1"
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} sao
            </option>
          ))}
        </select>

        <label className="block mb-2">Nhận xét:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border rounded px-2 py-1 mb-4"
          rows="4"
          required
        />

        <button type="submit" className="btn-primaryOne">
          Gửi đánh giá
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
