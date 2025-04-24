import { Route, Routes } from "react-router-dom"
import Header from "./components/Header"
import Home from "./pages/Home"
import Shop from "./pages/Shop"
import Contact from "./pages/Contact"
import Cart from "./pages/Cart"
import Login from "./pages/Login"
import PlaceOrder from "./pages/PlaceOrder"
import { ToastContainer } from "react-toastify"
import Orders from "./pages/Orders"
import Verify from "./pages/Verify"
import ProductDetail from "./pages/ProductDetail"
import EditUser from "./pages/EditUser"
import ProtectedRoute from "./components/ProtectedRoute"
import ShopContextProvider from "./context/ShopContext"
import OrderDetail from "./pages/OrderDetail"
import AddressManager from "./pages/AddressManager"
import UserSettings from "./pages/UserSetting"

const App = () => {
  return (
    <ShopContextProvider>
      <main className="overflow-hidden bg-primary">
        <ToastContainer />
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/order/:orderId" element={<OrderDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/usersetting" element={<UserSettings />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <EditUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-profile/address"
            element={
              <ProtectedRoute>
                <AddressManager />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </ShopContextProvider>

  )
}

export default App
