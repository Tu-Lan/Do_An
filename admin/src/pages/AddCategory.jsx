import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backend_url } from '../App.jsx';

const AddCategory = ({ token }) => {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !image) {
      toast.error('Vui lòng nhập tên thể loại và tải hình lên hình ảnh.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('image', image);

      const response = await axios.post(`${backend_url}/api/category/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setName('');
        setImage(null);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Thêm thể loại</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-600 font-medium">Tên thể loại</label>
          <input
            type="text"
            className="border p-4 w-full mt-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên thể loại..."
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-600 font-medium">Tải lên hình ảnh</label>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className="border p-4 w-full mt-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out w-full"
        >
          Thêm thể loại
        </button>
      </form>
    </div>
  );
};

export default AddCategory;