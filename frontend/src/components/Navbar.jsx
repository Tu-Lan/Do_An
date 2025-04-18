/* eslint-disable react/prop-types */
import { TbHomeFilled } from 'react-icons/tb';
import { IoLibrary } from 'react-icons/io5';
import { FaRegWindowClose } from 'react-icons/fa';
import { Link, NavLink } from 'react-router-dom';
import { useEffect, useRef } from 'react';

const Navbar = ({ containerStyles, toggleMenu, menuOpened }) => {
  const navItems = [
    { to: '/', label: 'Trang chủ', icon: <TbHomeFilled /> },
    { to: '/shop', label: 'Sản phẩm', icon: <IoLibrary /> },
  ];

  // Create a ref for the nav element
  const menuRef = useRef(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuOpened &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        toggleMenu();
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpened, toggleMenu]);

  return (
    <nav
      ref={menuRef}
      className={`${menuOpened ? 'flex' : 'hidden'
        } flex-col bg-white shadow-lg w-64 h-screen fixed top-0 left-0 z-50 p-4 ${containerStyles}`}
    >
      {/* Close Button */}
      <FaRegWindowClose
        onClick={toggleMenu}
        className="text-2xl text-gray-600 hover:text-gray-800 absolute top-4 right-4 cursor-pointer transition-colors duration-200 md:hidden"
      />

      {/* Logo and Title */}
      <Link to="/" className="flex items-center gap-2 mb-8 mt-4">
        <svg className="w-8 h-8 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <h4 className="text-2xl font-bold text-purple-600">Tri Thức</h4>
      </Link>

      {/* Navigation Items */}
      <div className="flex-1">
        {navItems.map(({ to, label, icon }) => (
          <div key={label} className="mb-2">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 ${isActive ? 'bg-gray-100 font-semibold' : ''
                }`
              }
              onClick={menuOpened ? toggleMenu : undefined}
            >
              <span className="text-xl">{icon}</span>
              <span className="text-base">{label}</span>
            </NavLink>
          </div>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;