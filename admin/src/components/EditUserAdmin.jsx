import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backend_url } from '../App';

const EditUser = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState({ name: '', email: '', password: '', image: '', gender: '', birth: '' });
  const [imageFile, setImageFile] = useState(null);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/user/get/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setUser({
          ...response.data.user,
          birth: response.data.user.birth ? response.data.user.birth.split('T')[0] : '',
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Không thể tải thông tin người dùng!");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', user.name);
    formData.append('email', user.email);
    formData.append('gender', user.gender);
    formData.append('birth', user.birth);
    if (user.password) formData.append('password', user.password);
    if (imageFile) formData.append('image', imageFile);

    try {
      const response = await axios.put(`${backend_url}/api/user/update/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/list-user');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Cập nhật thông tin thất bại!");
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Cập nhật thông tin người dùng</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label className="block font-medium">Tên</label>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded"
            required
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
            required
          />
        </div>
        <div>
          <label className="block font-medium">Giới tính</label>
          <select
            name="gender"
            value={user.gender}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded"
            required
          >
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
            required
          />
        </div>
        <div>
          <label className="block font-medium">Mật khẩu mới (tuỳ chọn)</label>
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Ảnh</label>
          <input
            type="file"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border rounded"
          />
        </div>
        {user.image && (
          <div>
            <label className="block font-medium">Ảnh hiện tại</label>
            <img src={user.image} alt="User" className="w-32 h-32 object-cover rounded" />
          </div>
        )}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Cập nhật
        </button>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition ml-2"
        >
          Trở về
        </button>
      </form>
    </div>
  );
};

export default EditUser;
