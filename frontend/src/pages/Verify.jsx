import { useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Verify = () => {
  const { navigate, token, setCartItems, backend_url } = useContext(ShopContext);
  const [searchParams] = useSearchParams();

  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');

  const verifyPayment = async () => {
    try {
      if (!token) {
        toast.error("Unauthorized: Token is missing.");
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${backend_url}/api/order/verifyStripe`,
        { success, orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Thanh toán thành công!");
        setCartItems({});
        navigate('/orders');
      } else {
        toast.error(response.data.message || "Thanh toán không thành công.");
        navigate('/');
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      const message = error.response?.data?.message || "Đã xảy ra lỗi khi xác minh thanh toán.";
      toast.error(message);
      navigate('/');
    }
  };

  useEffect(() => {
    verifyPayment();
  }, [token]);

  return <div>Loading...</div>;
};

export default Verify;