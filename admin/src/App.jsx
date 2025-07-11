/* eslint-disable react-refresh/only-export-components */
import SideBar from "./components/SideBar";
import { Routes, Route } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import "react-toastify";
import { ToastContainer } from "react-toastify";
import { useState, useEffect } from "react";
import Login from "./components/Login";
import EditProduct from "./components/EditProduct";
import OrderStats from "./pages/OrderStats";
import AddCategory from "./pages/AddCategory";
import ListCategory from "./pages/ListCategory";
import EditCategory from "./components/EditCategory";
import ListUser from "./pages/ListUser";
import EditUser from "./components/EditUserAdmin";
import AddUser from "./pages/AddUser";
import StockList from "./pages/StockList";
import AdminOrderDetail from "./components/AdminOrderDetail";
import UserStats from "./pages/UserStats";
import ProductSalesStats from "./pages/ProductSalesStats";
import ImportList from "./components/ImportList";
import Revenue from "./pages/Revenue";
export const backend_url = import.meta.env.VITE_BACKEND_URL;
export const currency = "đ";

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  return (
    <main>
      <ToastContainer />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <div className="bg-primary text-[#404040] min-h-screen">
          <div className="mx-auto max-w-[1440px] flex flex-col sm:flex-row">
            <div className="flex-shrink-0">
              <SideBar setToken={setToken} />
            </div>
            <div className="flex-1 bg-white overflow-auto">
              <Routes>
                <Route path="/" element={<Add token={token} />} />
                <Route path="/add-category" element={<AddCategory token={token} />} />
                <Route path="/add-user" element={<AddUser token={token} />} />
                <Route path="/list-user" element={<ListUser token={token} />} />
                <Route path="/list-stock" element={<StockList token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/list-import" element={<ImportList token={token} />} />
                <Route path="/list-category" element={<ListCategory token={token} />} />
                <Route path="/orders" element={<Orders token={token} />} />
                <Route path="/revenue" element={<Revenue token={token} />} />
                <Route path="/admin/order/:orderId" element={<AdminOrderDetail backend_url={backend_url} token={token} />} />
                <Route path="/edit-product/:id" element={<EditProduct token={token} />} />
                <Route path="/edit-category/:id" element={<EditCategory token={token} />} />
                <Route path="/update-user/:id" element={<EditUser token={token} />} />
                <Route path="/order-stats" element={<OrderStats token={token} />} />
                <Route path="/user-stats" element={<UserStats token={token} />} />
                <Route path="/product-stats" element={<ProductSalesStats token={token} />} />
              </Routes>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default App;
