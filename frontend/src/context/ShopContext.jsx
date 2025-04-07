/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "đ";
  const delivery_charges = 1000;
  const backend_url = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "");
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : {}; 
  });

  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart)); 
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems)); 
  }, [cartItems]);

  useEffect(() => {
    const axiosInstance = axios.create();

    axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          setToken(null);
          setUserId(null);
          navigate("/login");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject();
    };
  }, [navigate, setToken, setUserId]);

  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/product/list`);
      if (response.data.success) {
        setBooks(response.data.products);
        console.log("Sản phẩm đã được lấy thành công:", response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(error.message);
    }
  };
  const updateUserProfile = async (name, email, oldPassword, newPassword, image, gender, birth) => {
    if (!token) {
      toast.error("Bạn chưa đăng nhập.");
      return;
    }
    console.log("Current Token:", token); 
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (oldPassword && newPassword) {
        formData.append("oldPassword", oldPassword);
        formData.append("newPassword", newPassword);
      }
      if (image) {
        formData.append("image", image);
      }
      if (gender) {
        formData.append("gender", gender);
      }
      if (birth) {
        formData.append("birth", birth);
      }
      const response = await axios.put(`${backend_url}/api/user/profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setUserProfile(response.data.user);
        navigate("/"); 
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật hồ sơ người dùng.");
    }
  };

  const getCategoriesData = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/category/list`);
      if (response.data.success) {
        setCategories(response.data.categories);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(error.message);
    }
  };

  const getUserCart = async () => {
    if (!token) {
      const savedCart = localStorage.getItem("cartItems");
      setCartItems(savedCart ? JSON.parse(savedCart) : {}); 
      return;
    }

    try {
      const response = await axios.post(
        `${backend_url}/api/cart/get`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setCartItems(response.data.cart || {}); 
      } else {
        console.error("Trong giỏ hàng không có sản phẩm nào.");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error(error.message);
    }
  };


  const addToCart = async (itemId, quantityCart) => {
    if (!token) {
      toast.error("Bạn chưa đăng nhập.");
      return;
    }

    try {
      const response = await axios.post(
        `${backend_url}/api/cart/add`,
        { itemId, quantity: quantityCart },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCartItems(response.data.cart || {}); 
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi thêm vào giỏ hàng.");
    }
  };
  useEffect(() => {
    console.log("Saving cartItems to localStorage:", cartItems);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);



  useEffect(() => {
    if (token && userId) {
      // getUserCart();
      
      getCategoriesData();
    }
    getProductsData();
  }, [token, userId]);


  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUserId = localStorage.getItem("userId");
    if (savedToken && savedUserId) {
      setToken(savedToken);
      setUserId(savedUserId);
      fetchUserProfile();
    }
  }, [backend_url]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart)); 
    } else if (token) {
      getUserCart(); 
    }
  }, [token]);

  const getCartCount = () => {
    if (!cartItems || typeof cartItems !== "object") return 0;
    return Object.values(cartItems).reduce((total, quantityCart) => total + quantityCart, 0);
  };

  const getCartAmount = () => {
    if (!cartItems || typeof cartItems !== "object" || !books.length) return 0; 

    return Object.entries(cartItems).reduce((total, [itemId, quantityCart]) => {
      const item = books.find((book) => book._id === itemId);
      return item ? total + item.price * quantityCart : total;
    }, 0);
  };

  const updateQuantityCart = async (itemId, newQuantity) => {
    if (!token) {
      setCartItems((prevItems) => {
        const updatedCart = { ...prevItems, [itemId]: newQuantity };
        if (newQuantity === 0) delete updatedCart[itemId]; 
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
        return updatedCart;
      });
      return;
    }

    try {
      const response = await axios.post(
        `${backend_url}/api/cart/update`,
        { itemId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCartItems((prevItems) => {
          const updatedCart = { ...prevItems, [itemId]: newQuantity };
          if (newQuantity === 0) delete updatedCart[itemId];
          localStorage.setItem("cartItems", JSON.stringify(updatedCart)); 
          return updatedCart;
        });
        toast.success("Đã cập nhật giỏ hàng thành công.");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật giỏ hàng.");
    }
  };


  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setUserProfile(response.data.user);
        console.log("Đã lấy thông tin người dùng:", response.data.user);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi lấy thông tin.");
    }
  };


  const contextvalue = {
    books,
    categories,
    delivery_charges,
    currency,
    navigate,
    token,
    cartItems,
    setCartItems,
    setToken,
    addToCart,
    getCartCount,
    getUserCart,
    getCartAmount,
    updateQuantityCart,
    backend_url,
    userId,
    setUserId,
    userProfile,
    fetchUserProfile,
    updateUserProfile,
  };

  return (
    <ShopContext.Provider value={contextvalue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
