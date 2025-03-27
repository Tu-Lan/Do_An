import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { backend_url } from "../App";
import { toast } from "react-toastify";

const ListUser = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${backend_url}/api/user/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setUsers(data.users);
          setFilteredUsers(data.users);
        } else {
          toast.error("Không thể tải danh sách người dùng!");
        }
      } catch (error) {
        toast.error("Lỗi khi tải danh sách người dùng!");
      }
    };

    fetchUsers();
  }, [token]);

  useEffect(() => {
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [search, users]);

  const handleRemoveUser = async (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        const response = await fetch(`${backend_url}/api/user/delete/${userId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          toast.success("Người dùng đã được xóa thành công!");
          setUsers((prev) => prev.filter((user) => user._id !== userId)); // Cập nhật danh sách người dùng
        } else {
          toast.error(data.message || "Không thể xóa người dùng!");
        }
      } catch (error) {
        toast.error("Lỗi khi xóa người dùng!");
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Danh Sách Người Dùng</h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm người dùng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
        />
      </div>
      <div>
        {filteredUsers.length > 0 ? (
          <ul className="space-y-4">
            {filteredUsers.map((user) => (
              <li
                key={user._id}
                className="p-4 border rounded-lg shadow-sm flex justify-between items-center"
              >
                <div>
                  <h2 className="text-lg font-semibold">{user.name}</h2>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="flex space-x-4">
                  <Link
                    to={`/update-user/${user._id}`}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Chỉnh sửa
                  </Link>
                  <button
                    onClick={() => handleRemoveUser(user._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Xóa
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Không tìm thấy người dùng nào phù hợp.</p>
        )}
      </div>
    </div>
  );
};

export default ListUser;
