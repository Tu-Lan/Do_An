import { useEffect, useState, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import Navbar from "./Navbar";
import { CgMenuLeft } from "react-icons/cg";
import { TbUserCircle } from "react-icons/tb";
import { RiUserLine, RiShoppingBag4Line } from "react-icons/ri";
import { ShopContext } from "../context/ShopContext";

const Header = () => {
  const { navigate, token, setToken, getCartCount, cartItems } = useContext(ShopContext);
  const [cartQuantity, setCartQuantity] = useState(getCartCount());
  const [active, setActive] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State để kiểm soát menu User
  const menuRef = useRef(null); // Ref để theo dõi click ngoài

  useEffect(() => {
    setCartQuantity(getCartCount());
  }, [cartItems]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        if (menuOpened) {
          setMenuOpened(false);
        }
      }
      setActive(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [menuOpened]);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpened((prev) => !prev);
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
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Shop Logo" height={36} width={36} className="hidden sm:block mr-2" />
          <span className="text-lg font-bold text-gray-800">Tri Thức</span>
        </Link>

        {/* Navbar */}
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

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Menu Button (Mobile) */}
          <CgMenuLeft onClick={toggleMenu} className="text-2xl xl:hidden cursor-pointer" />

          {/* Cart Icon */}
          <Link to="/cart" className="relative">
            <RiShoppingBag4Line className="text-[33px] bg-secondary text-primary p-2 rounded-full" />
            {cartQuantity > 0 && (
              <span
                className="absolute -top-2 left-6 bg-red-500 text-white text-sm font-medium rounded-full w-6 h-6 flex items-center justify-center shadow-md"
              >
                {cartQuantity}
              </span>
            )}
          </Link>

          {/* User Section */}
          <div className="relative" ref={menuRef}>
            {token ? (
              <>
                {/* Nhấn vào icon để mở menu */}
                <TbUserCircle className="text-[29px] cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)} />

                {/* Menu User */}
                {isMenuOpen && (
                  <ul className="absolute right-0 top-10 bg-white shadow-md rounded-md p-2 w-40 ring-1 ring-gray-200">
                    <li onClick={() => navigate("/orders")} className="p-2 hover:bg-gray-100 cursor-pointer">
                      Đơn hàng
                    </li>
                    <li onClick={() => navigate("/edit-profile")} className="p-2 hover:bg-gray-100 cursor-pointer">
                      Hồ sơ
                    </li>
                    <li onClick={logout} className="p-2 hover:bg-red-100 text-red-500 cursor-pointer">
                      Đăng xuất
                    </li>
                  </ul>
                )}
              </>
            ) : (
              <button onClick={() => navigate("/login")} className="btn-outline flex items-center gap-2">
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
