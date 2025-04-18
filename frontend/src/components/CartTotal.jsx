import { useContext } from "react"
import { ShopContext } from "../context/ShopContext"
import Title from "./Title";

const CartTotal = () => {
  const { currency, getCartAmount, delivery_charges } = useContext(ShopContext);
  const cartAmount = getCartAmount();
  const isVND = currency === '₫';

  const formatCurrency = (value) => {
    return isVND
      ? `${value.toLocaleString('vi-VN')} ${currency}`
      : `${value.toLocaleString()} ${currency}`;
  };


  return (
    <div className="w-full">
      {/* Title */}
      <Title title1={'Tổng'} title2={'giỏ hàng'} title1Styles={'h3'} />

      <div className="flexCenter pt-3">
        <h5 className="h5">Tổng tiền sản phẩm:</h5>
        <p className="h5">{cartAmount === 0 ? '0' : formatCurrency(cartAmount)}</p>
      </div>

      <hr className="mx-auto h-[1px] w-full bg-gray-900/10 my-1" />

      <div className="flexCenter pt-3">
        <h5 className="h5">Phí vận chuyển:</h5>
        <p className="h5">{cartAmount === 0 ? '0' : formatCurrency(delivery_charges)}</p>
      </div>

      <hr className="mx-auto h-[1px] w-full bg-gray-900/10 my-1" />

      <div className="flexCenter pt-3">
        <h5 className="h5">Tổng:</h5>
        <p className="h5">
          {cartAmount === 0 ? '0' : formatCurrency(cartAmount + delivery_charges)}
        </p>
      </div>

      <hr className="mx-auto h-[1px] w-full bg-gray-900/10 my-1" />
    </div>
  )
}

export default CartTotal
