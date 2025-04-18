import { useState } from "react";

const Contact = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleContact = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleContact}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Liên hệ
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white shadow-lg rounded-lg p-4 w-72 z-10">
          <button
            onClick={toggleContact}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
          <p className="font-bold text-lg">1900 6656</p>
          <p className="text-sm text-gray-500">Thứ 2 - Thứ 6 (Giờ hành chính)</p>
          <p className="font-bold text-lg mt-2">0949854605</p>
          <p className="text-sm text-gray-500">Thứ 2 - Thứ 6 (Giờ hành chính)</p>
          <div className="flex gap-2 mt-4">
            <a href="#" className="text-blue-600 hover:text-blue-800">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" className="text-blue-600 hover:text-blue-800">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="text-blue-600 hover:text-blue-800">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="#" className="text-blue-600 hover:text-blue-800">
              <i className="fab fa-skype"></i>
            </a>
          </div>
          <p className="text-sm mt-4">Email: hotro@nhasachphuongnam.com</p>
          <p className="text-sm">Địa chỉ: Việt Nam, Hồ Chí Minh, 940 đường Ba Tháng Hai, Phường 15, Quận 11</p>
        </div>
      )}
    </div>
  );
};

export default Contact;