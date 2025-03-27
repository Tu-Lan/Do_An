import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { FaMinus, FaPlus } from "react-icons/fa";
import { TbTrash } from "react-icons/tb";
import CartTotal from "../components/CartTotal";

const Cart = () => {
  const { books, navigate, currency, cartItems, getCartAmount, updateQuantityCart } = useContext(ShopContext);
  const [cartTotal, setCartTotal] = useState(getCartAmount());

  useEffect(() => {
    setCartTotal(getCartAmount()); // Cập nhật tổng tiền mỗi khi giỏ hàng thay đổi
  }, [cartItems]);

  return (
    <main className="max-padd-container min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 pt-28">
        <Title title1={'Danh sách'} title2={'giỏ hàng'} title1Styles={'h3 text-gray-900'} />

        <div className="mt-6 space-y-4">
          {books.map((item) => {
            const itemCount = cartItems[item._id];
            if (itemCount > 0) {
              return (
                <article key={item._id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-shrink-0">
                      <img src={item.image} alt={`Sản phẩm ${item.name}`} className="w-24 h-24 object-cover rounded-lg" loading="lazy" />
                    </div>
                    <div className="flex-grow">
                      <h2 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h2>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-2">
                          <p className="text-gray-500 text-sm">{item.category}</p>
                          <div className="inline-flex items-center bg-gray-200 rounded-full p-1">
                            <button
                              onClick={() => updateQuantityCart(item._id, itemCount - 1)}
                              disabled={itemCount <= 1}
                              className="bg-gray-300 p-2 rounded-full shadow hover:bg-gray-400 disabled:opacity-50"
                            >
                              <FaMinus className="text-xs text-gray-700" />
                            </button>
                            <span className="px-4 font-medium text-gray-800">{itemCount}</span>
                            <button
                              onClick={() => updateQuantityCart(item._id, itemCount + 1)}
                              disabled={itemCount >= item.quantity}
                              className="bg-gray-300 p-2 rounded-full shadow hover:bg-gray-400 disabled:opacity-50"
                            >
                              <FaPlus className="text-xs text-gray-700" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-xl font-bold text-blue-600">{item.price * itemCount}{currency}</p>
                          <button onClick={() => updateQuantityCart(item._id, 0)} className="p-2 text-red-600 hover:bg-red-100 rounded-full">
                            <TbTrash className="text-xl" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            }
            return null;
          })}
        </div>

        {/* Hiển thị tổng tiền cập nhật */}
        <div className="mt-12 mb-8">
          <div className="max-w-md mx-auto">
            <CartTotal total={cartTotal} />
            <button
              onClick={() => navigate('/place-order')}
              className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-500"
            >
              Thanh toán ({cartTotal}{currency})
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;
