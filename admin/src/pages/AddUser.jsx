import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backend_url } from '../App';

const AddUser = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({ name: '', email: '', password: '', gender: '', birth: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const validateInputs = () => {
    if (!user.name.trim() || !user.email.trim() || !user.password || !user.gender || !user.birth) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(user.email)) {
      toast.error('Email không hợp lệ');
      return false;
    }
    if (user.password.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) return;

    try {
      const response = await axios.post(`${backend_url}/api/user/register`, user);

      if (response.data.success) {
        toast.success('Đăng ký người dùng thành công!');
        navigate('/list-user');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Thêm người dùng thất bại!';
      toast.error(message);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Thêm người dùng mới</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label className="block font-medium">Tên</label>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Mật khẩu</label>
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Giới tính</label>
          <select
            name="gender"
            value={user.gender}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">Chọn giới tính</option>
            <option value="Male">Nam</option>
            <option value="Female">Nữ</option>
            <option value="Other">Khác</option>
          </select>

        </div>
        <div>
          <label className="block font-medium">Ngày sinh</label>
          <input
            type="date"
            name="birth"
            value={user.birth}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Thêm người dùng
        </button>
      </form>
    </div>
  );
};

export default AddUser;