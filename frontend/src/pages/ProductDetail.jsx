import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { FaMinus, FaPlus } from "react-icons/fa";
import Footer from "../components/Footer";
import axios from "axios";
import { toast } from "react-toastify";
import Rating from "react-rating-stars-component";

const ProductDetail = () => {
  const { id } = useParams();
  const { books, addToCart, currency, token, backend_url } = useContext(ShopContext);
  const [product, setProduct] = useState(null);
  const [quantityCart, setQuantityCart] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const userId = localStorage.getItem("userId"); 
  const [editMode, setEditMode] = useState(false); 
  const [editReviewId, setEditReviewId] = useState(null); 

  useEffect(() => {
    const foundProduct = books.find((book) => book._id === id);
    setProduct(foundProduct);

    if (foundProduct) {
      const filteredProducts = books.filter(
        (book) => book.category === foundProduct.category && book._id !== id
      );
      setRelatedProducts(filteredProducts);
      fetchReviews(foundProduct._id);
    }
  }, [id, books]);

  const fetchReviews = async (productId) => {
    try {
      const response = await axios.get(`${backend_url}/api/review/product/${productId}`);
      if (response.data.success) {
        setReviews(response.data.reviews);
      } else {
        toast.error("Không thể tải đánh giá.");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Lỗi khi tải đánh giá.");
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product._id, quantityCart);
    }
  };

  const increaseQuantityCart = () => {
    if (product && quantityCart < product.quantity) {
      setQuantityCart((prev) => prev + 1);
    }
  };

  const decreaseQuantityCart = () => {
    setQuantityCart((prev) => Math.max(1, prev - 1));
  };

  const handleEditClick = (review) => {
    setEditMode(true); 
    setEditReviewId(review._id); 
    setRating(review.rating); 
    setComment(review.comment);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment) {
      toast.error("Vui lòng nhập đánh giá và xếp hạng.");
      return;
    }

    try {
      if (editMode) {
        const response = await axios.put(
          `${backend_url}/api/review/update/${editReviewId}`,
          { rating, comment },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          toast.success("Đánh giá đã được cập nhật.");
          setEditMode(false); 
          setEditReviewId(null); 
        } else {
          toast.error("Không thể cập nhật đánh giá.");
        }
      } else {
        const response = await axios.post(
          `${backend_url}/api/review/add`,
          { productId: product._id, rating, comment },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          toast.success("Đánh giá đã được thêm.");
        } else {
          toast.error("Không thể thêm đánh giá.");
        }
      }

      setRating(0); 
      setComment(""); 
      fetchReviews(product._id); 
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Lỗi khi gửi đánh giá.");
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleReviewUpdate = async (reviewId, updatedRating, updatedComment) => {
    try {
      const response = await axios.put(
        `${backend_url}/api/review/update/${reviewId}`,
        { rating: updatedRating, comment: updatedComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success("Đánh giá đã được cập nhật.");
        fetchReviews(product._id);
      } else {
        toast.error("Không thể cập nhật đánh giá.");
      }
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Lỗi khi cập nhật đánh giá.");
    }
  };

  const handleReviewDelete = async (reviewId) => {
    try {
      const response = await axios.delete(
        `${backend_url}/api/review/delete/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success("Đánh giá đã được xóa.");
        fetchReviews(product._id);
      } else {
        toast.error("Không thể xóa đánh giá.");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Lỗi khi xóa đánh giá.");
    }
  };

  if (!product) return <div>Đang tải...</div>;

  const shortDescription = product.description.length > 100
    ? product.description.substring(0, 100) + "..."
    : product.description;

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
    : 0;

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((review) => {
    ratingCounts[review.rating] += 1;
  });

  const ratingPercentages = {};
  for (let i = 1; i <= 5; i++) {
    ratingPercentages[i] = totalReviews > 0 ? ((ratingCounts[i] / totalReviews) * 100).toFixed(0) : 0;
  }

  return (
    <section className="max-padd-container">
      <div className="pt-28">
        <Title title1="Chi tiết" title2="sách" title1Styles="text-2xl font-bold" />
        <div className="flex flex-row mt-4">
          <div className="flex flex-col items-center gap-6">
            <img
              src={product.image}
              alt={product.name}
              className="w-[300px] h-[400px] object-contain rounded-lg shadow-lg"
            />
            <div className="flex gap-3">
              <img
                src={product.image}
                alt="thumbnail"
                className="w-16 h-16 object-cover border"
              />
              <img
                src={product.image}
                alt="thumbnail"
                className="w-16 h-16 object-cover border"
              />
              <img
                src={product.image}
                alt="thumbnail"
                className="w-16 h-16 object-cover border"
              />
            </div>
          </div>
          <article className="ml-10 w-1/2">
            <h4 className="text-lg font-bold">Tên sách: {product.name}</h4>
            <p className="text-sm my-2">Tác giả: {product.author}</p>
            <p className="text-sm my-2 font-semibold">Nhà sản xuất: {product.publisher}</p>

            <div className="flex gap-1">
              <h5 className="text-md">Giá: {product.price}</h5>
              <p className="font-semibold">{currency}</p>
            </div>
            <p className="text-sm my-2">
              {product.quantity > 0 ? `Còn: ${product.quantity}` : "Hết hàng"}
            </p>
            <p className="text-sm my-2">
              Mô tả: {isDescriptionExpanded ? product.description : shortDescription}
              {product.description.length > 100 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-blue-500 ml-2 underline"
                >
                  {isDescriptionExpanded ? "Thu gọn" : "Xem thêm"}
                </button>
              )}
            </p>

            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center ring-1 ring-slate-900/5 rounded-full overflow-hidden bg-primary">
                <button
                  onClick={decreaseQuantityCart}
                  className="bg-white p-1.5 shadow-md rounded-full"
                >
                  <FaMinus className="text-xs" />
                </button>
                <p className="px-2">{quantityCart}</p>
                <button
                  onClick={increaseQuantityCart}
                  disabled={quantityCart >= product.quantity}
                  className={`bg-white p-1.5 shadow-md rounded-full ${quantityCart >= product.quantity ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <FaPlus className="text-xs" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.quantity === 0}
                className={`px-4 py-2 ${product.quantity === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
                  } rounded transition-colors`}
              >
                {product.quantity === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
              </button>
            </div>

            <div className="mt-4 text-sm">
              <p>Gọi đặt hàng: <span className="font-semibold">0879817410</span> hoặc <span className="font-semibold">0839999999</span></p>
            </div>

            <div className="mt-4 text-sm">
              <p>Thông tin & Khuyến mãi:</p>
              <ul className="list-disc pl-5">
                <li>Đổi trả hàng trong vòng 7 ngày.</li>
                <li>Freeship nội thành Hà Nội từ 150.000đ.</li>
                <li>Freeship toàn quốc từ 250.000đ.</li>
              </ul>
            </div>
          </article>
        </div>

        <div className="mt-10">
          <h3 className="text-2xl font-bold mb-4">Viết đánh giá</h3>
          <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Xếp hạng</label>
              <Rating
                count={5}
                size={24}
                activeColor="#ffd700"
                value={rating}
                onChange={(newRating) => setRating(newRating)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bình luận</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="4"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {editMode ? "Cập nhật đánh giá" : "Gửi đánh giá"} 
            </button>
          </form>
        </div>

        <div className="mt-10">
          <h3 className="text-2xl font-bold mb-4">Đánh giá</h3>

          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <h4 className="text-lg font-semibold mb-2">Đánh giá sản phẩm</h4>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{averageRating}/5</p>
                <Rating
                  count={5}
                  size={20}
                  value={parseFloat(averageRating)}
                  edit={false}
                  activeColor="#ffd700"
                />
                <p className="text-sm text-gray-500">({totalReviews} đánh giá)</p>
              </div>
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-12 text-sm">{star} sao</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded">
                      <div
                        className="h-2 bg-yellow-400 rounded"
                        style={{ width: `${ratingPercentages[star]}%` }}
                      />
                    </div>
                    <span className="w-12 text-sm text-right">{ratingPercentages[star]}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {reviews.length === 0 ? (
            <p>Chưa có đánh giá nào.</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="mb-4">
                <p className="font-semibold">{review.userId?.name || "Ẩn danh"}</p>
                <Rating
                  count={5}
                  size={16}
                  value={review.rating}
                  edit={false}
                  activeColor="#ffd700"
                />
                <p>{review.comment}</p>
                {review.userId?._id === userId && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(review)} 
                      className="text-blue-500"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleReviewDelete(review._id)}
                      className="text-red-500"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-10 pb-10">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center md:text-left">
              Sản phẩm cùng thể loại
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct._id}
                  className="group border-2 border-gray-100 p-3 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col"
                >
                  <Link
                    to={`/product/${relatedProduct._id}`}
                    className="w-full mb-3 flex-grow flex flex-col"
                  >
                    <div className="aspect-square mb-3 overflow-hidden rounded-lg">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-contain mx-auto transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <h5 className="font-semibold text-gray-700 text-base mb-1 text-center line-clamp-2">
                      {relatedProduct.name}
                    </h5>
                    <p className="text-black-500 font-medium text-center text-lg">
                      {relatedProduct.price}{currency}
                    </p>
                  </Link>

                  <button
                    onClick={() => addToCart(relatedProduct._id, 1)}
                    className="mt-auto bg-blue-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 text-base font-medium"
                  >
                    Thêm vào giỏ hàng
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </section>
  );
};

export default ProductDetail;