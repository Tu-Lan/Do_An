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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment) {
      toast.error("Vui lòng nhập đánh giá và xếp hạng.");
      return;
    }

    try {
      const response = await axios.post(
        `${backend_url}/api/review/add`,
        { productId: product._id, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Đánh giá đã được thêm.");
        setRating(0);
        setComment("");
        fetchReviews(product._id);
      } else {
        toast.error("Không thể thêm đánh giá.");
      }
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error("Lỗi khi thêm đánh giá.");
    }
  };

  if (!product) return <div>Đang tải...</div>;

  return (
    <section className="max-padd-container">
      <div className="pt-28">
        <Title title1="Chi tiết" title2="sách" title1Styles="text-2xl font-bold" />
        <div className="flex flex-row mt-4">
          <div className="flex flex-col items-center gap-6">
            <img
              src={product.image}
              alt={product.name}
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
            <div className="flex gap-3">
              {/* Small image thumbnails */}
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
            <p className="text-sm my-2">Mô tả: {product.description}</p>
            <p className="text-sm my-2">Tác giả: {product.author}</p>

            {/* Nhà sản xuất */}
            <p className="text-sm my-2 font-semibold">Nhà sản xuất: {product.publisher}</p>

            <div className="flex gap-1">
              <h5 className="text-md">Giá: {product.price}</h5>
              <p className="font-semibold">{currency}</p>
            </div>
            <p className="text-sm my-2">
              {product.quantity > 0 ? `Còn: ${product.quantity}` : "Hết hàng"}
            </p>

            {/* Quantity Selector */}
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

            {/* Action Buttons */}
            <div className="mt-4">
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

            {/* Phone numbers */}
            <div className="mt-4 text-sm">
              <p>Gọi đặt hàng: <span className="font-semibold">0879817410</span> hoặc <span className="font-semibold">0839999999</span></p>
            </div>

            {/* Promotion */}
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

        {/* Form đánh giá */}
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
              Gửi đánh giá
            </button>
          </form>
        </div>

        {/* Danh sách đánh giá */}
        <div className="mt-10">
          <h3 className="text-2xl font-bold mb-4">Đánh giá</h3>
          {reviews.length === 0 ? (
            <p>Chưa có đánh giá nào.</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="mb-4">
                <p className="font-semibold">{review.userId.name}</p>
                <p>Xếp hạng: {review.rating}</p>
                <p>{review.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* Gợi ý sản phẩm cùng thể loại */}
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