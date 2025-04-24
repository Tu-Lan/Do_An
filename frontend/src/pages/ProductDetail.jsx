import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { FaMinus, FaPlus } from "react-icons/fa";
import Footer from "../components/Footer";
import ReactStars from "react-rating-stars-component";
import axios from "axios";

const ProductDetail = () => {
  const { id } = useParams();
  const { books, addToCart, currency, token, backend_url } = useContext(ShopContext);
  const [product, setProduct] = useState(null);
  const [quantityCart, setQuantityCart] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [reviews, setReviews] = useState([]); // State for reviews

  useEffect(() => {
    const foundProduct = books.find((book) => book._id === id);
    setProduct(foundProduct);

    if (foundProduct) {
      const filteredProducts = books.filter(
        (book) => book.category === foundProduct.category && book._id !== id
      );
      setRelatedProducts(filteredProducts);

      // Fetch reviews for the product
      const fetchReviews = async () => {
        try {
          const response = await axios.get(`${backend_url}/api/review/product/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.success) {
            setReviews(response.data.reviews);
          }
        } catch (error) {
          console.error("Error fetching reviews:", error);
        }
      };
      fetchReviews();
    }
  }, [id, books, backend_url, token]);

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

  if (!product) return <div className="flex justify-center items-center h-screen text-gray-600 text-lg">Đang tải...</div>;

  const shortDescription = product.description.length > 100
    ? product.description.substring(0, 100) + "..."
    : product.description;

  return (
    <section className="max-padd-container">
      <div className="pt-28">
        <Title
          title1="Chi tiết"
          title2="sách"
          title1Styles="text-2xl font-bold"
        />
        <div className="flex flex-col md:flex-row mt-4 gap-8">
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
          <article className="flex-1">
            <h4 className="text-lg font-bold">Tên sách: {product.name}</h4>
            <p className="text-sm my-2">Tác giả: {product.author}</p>
            <p className="text-sm my-2 font-semibold">
              Nhà sản xuất: {product.publisher}
            </p>

            <div className="flex gap-1">
              <h5 className="text-md">
                Giá: {product.price.toLocaleString("vi-VN")}
              </h5>
              <p className="font-semibold">{currency}</p>
            </div>
            <p className="text-sm my-2">
              {product.quantity > 0 ? `Còn: ${product.quantity}` : "Hết hàng"}
            </p>
            <p className="text-sm my-2">
              Mô tả:{" "}
              {isDescriptionExpanded ? product.description : shortDescription}
              {product.description.length > 100 && (
                <button
                  onClick={() =>
                    setIsDescriptionExpanded(!isDescriptionExpanded)
                  }
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
                  className={`bg-white p-1.5 shadow-md rounded-full ${
                    quantityCart >= product.quantity
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <FaPlus className="text-xs" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.quantity === 0}
                className={`px-4 py-2 ${
                  product.quantity === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                } rounded transition-colors`}
              >
                {product.quantity === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
              </button>
            </div>

            <div className="mt-4 text-sm">
              <p>
                Gọi đặt hàng: <span className="font-semibold">0879817410</span>{" "}
                hoặc <span className="font-semibold">0839999999</span>
              </p>
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

        {/* Reviews Section */}
        <div className="mt-10 pb-10">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 ">
            Đánh giá sản phẩm
          </h3>
          {reviews.length > 0 ? (
            <div className="space-y-6 max-w-2xl">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <div className="flex gap-4 mb-2">
                    <ReactStars
                      count={5}
                      value={review.rating}
                      edit={false}
                      size={24}
                      activeColor="#ffd700"
                    />
                  </div>
                  <p className="text-gray-600">
                    Nội dung đánh giá: {review.comment}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Đánh giá bởi: {review.userId?.name || "Người dùng ẩn danh"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-sm text-center max-w-2xl mx-auto">
              <p className="text-gray-600">
                Chưa có đánh giá nào cho sản phẩm này.
              </p>
            </div>
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
                      {relatedProduct.price.toLocaleString("vi-VN")}
                      {currency}
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