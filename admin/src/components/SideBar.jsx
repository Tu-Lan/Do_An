import React, { useState } from 'react';
import { BiSolidCategory } from 'react-icons/bi';
import { ImStatsDots } from 'react-icons/im';
import { IoIosAddCircle, IoIosListBox } from 'react-icons/io';
import { FaBars, FaBook, FaBookMedical } from 'react-icons/fa';
import { AiOutlineDown, AiOutlineUp } from 'react-icons/ai';
import { FaRegUser, FaShoppingCart } from "react-icons/fa";
import { Link, NavLink } from 'react-router-dom';
import Logo from '../assets/logo.png';

const SideBar = ({ setToken }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownState, setDropdownState] = useState({});

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const toggleDropdown = (key) => {
    setDropdownState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navLinkStyles =
    'p-4 flex items-center gap-4 hover:bg-gray-100 cursor-pointer';

  const renderNavLink = (to, icon, label) => (
    <NavLink
      to={to}
      onClick={() => setIsMenuOpen(false)}
      className={navLinkStyles}
    >
      {icon} {label}
    </NavLink>
  );

  const renderDropdownArrow = (isOpen) => (
    isOpen ? <AiOutlineUp size={16} /> : <AiOutlineDown size={16} />
  );

  return (
    <div className="flex">
      {/* Mobile Toggle Button */}
      <button onClick={toggleMenu} className="p-4 sm:hidden">
        <FaBars size={24} />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 bg-white h-full w-64 z-50 transition-transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } sm:translate-x-0 sm:relative`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo */}
          <div className="p-4 border-b">
            <Link to="/" className="flex items-center gap-4">
              <img src={Logo} alt="Logo" className="w-8 h-8" />
              <span className="text-lg font-bold">Tri Thức</span>
            </Link>
          </div>

          {/* Menu Items */}
          <div className="flex-1 flex flex-col">
            <ul>
              <li>
                <div
                  className="p-4 flex items-center justify-between hover:bg-gray-100 cursor-pointer"
                  onClick={() => toggleDropdown('nguoiDung')}
                >
                  <div className="flex items-center gap-4">
                    <FaRegUser size={20} />
                    <span>Người dùng</span>
                  </div>
                  {renderDropdownArrow(dropdownState.nguoiDung)}
                </div>
                {dropdownState.nguoiDung && (
                  <ul className="pl-8">
                    <li>{renderNavLink('/add-user', <IoIosAddCircle size={20} />, 'Thêm người dùng')}</li>
                    <li>{renderNavLink('/list-user', <IoIosListBox size={20} />, 'Danh sách người dùng')}</li>
                  </ul>
                )}
              </li>

              <li>
                <div
                  className="p-4 flex items-center justify-between hover:bg-gray-100 cursor-pointer"
                  onClick={() => toggleDropdown('sach')}
                >
                  <div className="flex items-center gap-4">
                    <FaBook size={20} />
                    <span>Sách</span>
                  </div>
                  {renderDropdownArrow(dropdownState.sach)}
                </div>
                {dropdownState.sach && (
                  <ul className="pl-8">
                    <li>{renderNavLink('/', <FaBookMedical size={20} />, 'Thêm sách vào kho')}</li>
                    <li>{renderNavLink('/list-stock', <FaBookMedical size={20} />, 'Danh sách kho')}</li>
                    <li>{renderNavLink('/list', <IoIosListBox size={20} />, 'Danh sách sách đang bán')}</li>
                  </ul>
                )}
              </li>

              <li>
                <div
                  className="p-4 flex items-center justify-between hover:bg-gray-100 cursor-pointer"
                  onClick={() => toggleDropdown('theLoai')}
                >
                  <div className="flex items-center gap-4">
                    <BiSolidCategory size={20} />
                    <span>Thể loại</span>
                  </div>
                  {renderDropdownArrow(dropdownState.theLoai)}
                </div>
                {dropdownState.theLoai && (
                  <ul className="pl-8">
                    <li>{renderNavLink('/add-category', <IoIosAddCircle size={20} />, 'Thêm thể loại')}</li>
                    <li>{renderNavLink('/list-category', <IoIosListBox size={20} />, 'Danh sách thể loại')}</li>
                  </ul>
                )}
              </li>

              <li>
                {renderNavLink('/orders', <FaShoppingCart size={20} />, 'Đơn hàng')}
              </li>
              <li>
                <div
                  className="p-4 flex items-center justify-between hover:bg-gray-100 cursor-pointer"
                  onClick={() => toggleDropdown('thongKe')}
                >
                  <div className="flex items-center gap-4">
                    <BiSolidCategory size={20} />
                    <span>Thống kê</span>
                  </div>
                  {renderDropdownArrow(dropdownState.thongKe)}
                </div>
                {dropdownState.thongKe && (
                  <ul className="pl-8">
                    <li>{renderNavLink('/order-stats', <ImStatsDots size={20} />, 'Thống kê đơn hàng')}</li>
                    {/* <li>{renderNavLink('/user-stats', <IoIosListBox size={20} />, 'Thống kê người dùng')}</li> */}
                    <li>{renderNavLink('/product-stats', <ImStatsDots size={20} />, 'Thống kê sản phẩm')}</li>
                  </ul>
                )}
              </li>
            </ul>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <button
              onClick={() => setToken('')}
              className="w-full py-2 bg-red-500 text-white rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for Mobile */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 sm:hidden"
          onClick={toggleMenu}
        ></div>
      )}
    </div>
  );
};

export default SideBar;
