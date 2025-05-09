import { useState, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import { CgMenuLeft } from "react-icons/cg";
import { TbUserCircle } from "react-icons/tb";
import { RiUserLine, RiShoppingBag4Line } from "react-icons/ri";
import { ShopContext } from "../context/ShopContext";
import { IoCallOutline } from "react-icons/io5";
import { FaFacebookF, FaInstagram, FaYoutube, FaTwitter } from "react-icons/fa"; 

const Header = () => {
  const { navigate, token, setToken, getCartCount } = useContext(ShopContext);
  const [cartQuantity, setCartQuantity] = useState(getCartCount());
  const [active, setActive] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false); 
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setMenuOpened((prev) => !prev);
  };

  const toggleContact = () => {
    setIsContactOpen((prev) => !prev); 
  };

  const logout = () => {
    navigate("/");
    localStorage.removeItem("token");
    setToken("");
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 shadow-md bg-white">
      <div
        className={`${active ? "bg-white py-2 shadow-sm" : "bg-primary py-3"
          } max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300`}
      >
        <Link to="/" className="flex items-center">
          <svg className="w-8 h-8 text-purple-600 hidden sm:block mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="text-lg font-bold text-gray-800">Tri Thức</span>
        </Link>
        <nav
          className={`${menuOpened
            ? "fixed inset-0 bg-white flex flex-col gap-6 p-6 z-50"
            : "hidden xl:flex gap-x-8"
            }`}
        >
          <Navbar
            menuOpened={menuOpened}
            toggleMenu={toggleMenu}
            containerStyles={`${menuOpened ? "flex flex-col gap-y-4" : "flex justify-center gap-x-8"
              }`}
          />
        </nav>

        <div className="flex items-center gap-4">
          {/* Icon menu */}
          <CgMenuLeft
            onClick={toggleMenu}
            className="text-2xl xl:hidden cursor-pointer hover:scale-110 transition-transform"
          />

          {/* Icon điện thoại */}
          <div className="relative flex items-center justify-center">
            <IoCallOutline
              onClick={toggleContact}
              className="text-[40px] bg-secondary text-primary p-3 rounded-full cursor-pointer shadow-md hover:scale-110 transition-transform"
            />
            {isContactOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-lg p-4 w-72 z-10">
                <button
                  onClick={toggleContact}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
                <p className="font-bold text-lg">1900 6656</p>
                <p className="text-sm text-gray-500">Thứ 2 - Thứ 6 (Giờ hành chính)</p>
                <p className="font-bold text-lg mt-2">0879817410</p>
                <p className="text-sm text-gray-500">Thứ 2 - Thứ 6 (Giờ hành chính)</p>
                <div className="flex gap-2 mt-4">
                  <a
                    href="https://facebook.com/dacquyet1110"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaFacebookF />
                  </a>
                  <a
                    href="https://instagram.com/_dieplucc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-500 hover:text-pink-700"
                  >
                    <FaInstagram />
                  </a>
                  <a
                    href="https://youtube.com/@diepluc1110"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaYoutube />
                  </a>
                  <a
                    href="https://twitter.com/diepluc1110"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <FaTwitter />
                  </a>
                </div>
                <p className="text-sm mt-4">Email: luuphuongvy0209@gmail.com</p>
                <p className="text-sm">Địa chỉ: 51 Hòa Bình 3, Minh Khai, Hai Bà Trưng, Hà Nội</p>
              </div>
            )}
          </div>

          {/* Icon giỏ hàng */}
          <Link to="/cart" className="relative">
            <RiShoppingBag4Line
              className="text-[33px] bg-secondary text-primary p-2 rounded-full cursor-pointer shadow-md hover:scale-110 transition-transform"
            />
            {cartQuantity > 0 && (
              <span
                className="absolute -top-2 left-6 bg-red-500 text-white text-sm font-medium rounded-full w-6 h-6 flex items-center justify-center shadow-md"
              >
                {cartQuantity}
              </span>
            )}
          </Link>

          {/* Icon người dùng */}
          <div className="relative" ref={menuRef}>
            {token ? (
              <>
                <TbUserCircle
                  className="text-[29px] cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                />
                {isMenuOpen && (
                  <ul className="absolute right-0 top-10 bg-white shadow-md rounded-md p-2 w-40 ring-1 ring-gray-200">
                    <li
                      onClick={() => navigate("/orders")}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      Đơn hàng
                    </li>
                    <li
                      onClick={() => navigate("/usersetting")}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      Cài đặt
                    </li>
                    <li
                      onClick={logout}
                      className="p-2 hover:bg-red-100 text-red-500 cursor-pointer"
                    >
                      Đăng xuất
                    </li>
                  </ul>
                )}
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="btn-outline flex items-center gap-2 hover:scale-110 transition-transform"
              >
                Đăng nhập <RiUserLine />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;