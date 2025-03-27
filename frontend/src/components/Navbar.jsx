/* eslint-disable react/prop-types */
import { TbHomeFilled } from 'react-icons/tb';
import { IoLibrary, IoMailOpen } from 'react-icons/io5';
import { FaRegWindowClose } from 'react-icons/fa';
import { Link, NavLink } from 'react-router-dom';


const Navbar = ({ containerStyles, toggleMenu, menuOpened }) => {
  const navItems = [
    { to: '/', label: "Trang chủ", icon: <TbHomeFilled /> },
    { to: '/shop', label: "Sản phẩm", icon: <IoLibrary /> },
    { to: 'mailto:luuphuongvy0209@gmail.com', label: "Liên hệ", icon: <IoMailOpen /> },
  ]
  return (
    <nav className={containerStyles}>
      {/* close button inside navbar */}
      {menuOpened && (
        <>
          <FaRegWindowClose onClick={toggleMenu} className='text-xl self-end cursor-pointer relative left-8' />
          <Link to={'/'} className='bold-24 mb-10'>
            <h4 className='text-secondary'>Tri Thức</h4>
          </Link>
        </>
      )}
      {navItems.map(({ to, label, icon }) => (
        <div key={label} className='inline-flex relative top-1'>
          {to.startsWith('mailto') ? (
            <a href={to} onClick={menuOpened ? toggleMenu : undefined} className='flexCenter gap-x-2'>
              <span className='text-xl'>{icon}</span>
              <span className='medium-16'>{label}</span>
            </a>
          ) : (
            <NavLink to={to} className={({ isActive }) => isActive ? "active-link flexCenter gap-x-2" : "flexCenter gap-x-2"}>
              <span className='text-xl'>{icon}</span>
              <span className='medium-16'>{label}</span>
            </NavLink>
          )}
        </div>
      ))}
    </nav>
  )
}

export default Navbar
