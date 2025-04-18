/* eslint-disable react/prop-types */
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { TbShoppingBagPlus } from 'react-icons/tb';
import { ShopContext } from '../context/ShopContext';

const Item = ({ book }) => {
  const { currency, addToCart } = useContext(ShopContext);

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    addToCart(book._id, 1); 
  };

  return (
    <div>
      <Link to={`/product/${book._id}`}>
        <div className="flexCenter bg-primary p-6 rounded-3xl overflow-hidden relative group">
          <img
            src={book.image}
            alt={book.name}
            className="w-48 h-72 object-cover shadow-xl shadow-slate-900/30 rounded-lg"
          />

        </div>
      </Link>
      <div className="p-3">
        <div className="flexBetween">
          <h4 className="h4 line-clamp-1 !my-0">{book.name}</h4>
          <button
            onClick={handleAddToCart}
            disabled={book.quantity <= 0} 
            className={`flexCenter h-8 w-8 rounded cursor-pointer bg-transparent border-none p-0 ${book.quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            <TbShoppingBagPlus className="text-lg" />
          </button>
        </div>
        <p className="line-clamp-2 py-1">Thể loại: {book.category}</p>
        <p className="line-clamp-2 py-1">Giá: {book.price.toLocaleString('vi-VN')}{currency}</p>
        {/* <p className="line-clamp-2 py-1">Mô tả: {book.description}</p> */}
        <p className="line-clamp-1 py-1 truncate">Tác giả: {Array.isArray(book.author) ? book.author.join(', ') : book.author}</p>
        <p className="pt-1 text-sm font-semibold text-gray-600">
          {book.quantity > 0 ? `Còn: ${book.quantity}` : 'Hết hàng'}
        </p>
      </div>
    </div>
  );
};

export default Item;
