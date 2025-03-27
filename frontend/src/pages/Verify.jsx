import { useContext, useEffect } from "react"
import { ShopContext } from "../context/ShopContext"
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
        setCartItems({});
        navigate('/orders');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    verifyPayment();
  }, [token]);

  return (
    <div>
      
    </div>
  )
}

export default Verify
