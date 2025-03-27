import { useContext, useEffect, useState } from "react";
import loginImg from "../assets/login.png";
import logo from "../assets/logo.png";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const { token, setToken, setUserId, navigate, backend_url } = useContext(ShopContext);

  const [currState, setCurrState] = useState("Đăng nhập");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("Male"); // Giá trị mặc định
  const [birth, setBirth] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currState === "Đăng ký") {
        // Gửi yêu cầu đăng ký
        const response = await axios.post(`${backend_url}/api/user/register`, {
          name,
          email,
          password,
          gender,
          birth,
        });

        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          setUserId(response.data.userId);
          localStorage.setItem("userId", response.data.userId);
          toast.success("Đăng ký thành công!");
          navigate("/"); // Điều hướng sau khi đăng ký
        } else {
          toast.error(response.data.message);
        }
      } else {
        // Gửi yêu cầu đăng nhập
        const response = await axios.post(`${backend_url}/api/user/login`, {
          email,
          password,
        });

        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          setUserId(response.data.userId);
          localStorage.setItem("userId", response.data.userId);
          toast.success("Đăng nhập thành công!");
          navigate("/"); // Điều hướng sau khi đăng nhập
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi không mong muốn.";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/"); // Nếu đã đăng nhập, điều hướng về trang chính
    }
  }, [token, navigate]);

  return (
    <section className="absolute top-0 left-0 h-full w-full z-50 bg-white">
      <div className="flex h-full flex-wrap">
        {/* Image side */}
        <div className="w-1/2 hidden sm:block">
          <img src={loginImg} alt="LoginImg" className="object-cover aspect-square h-full w-full" />
        </div>
        {/* Form side */}
        <div className="flexCenter w-full sm:w-1/2 relative">
          <div className="absolute top-4 left-8 cursor-pointer">
            <img
              src={logo}
              alt="Logo"
              className="w-12 h-12 object-contain hover:opacity-80 transition-opacity"
              onClick={() => navigate('/')}
            />
          </div>
          <form
            onSubmit={onSubmitHandler}
            className="flex flex-col items-center w-[90%] sm:max-w-md m-auto gap-y-5 text-gray-800"
          >
            <div className="w-full mb-4">
              <h3 className="bold-36">{currState}</h3>
            </div>
            {currState === "Đăng ký" && (
              <>
                <div className="w-full">
                  <label htmlFor="name" className="medium-14">
                    Họ và tên
                  </label>
                  <input
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    type="text"
                    placeholder="Họ và tên"
                    className="w-full px-3 py-1 ring-1 ring-slate-900/10 rounded bg-primary mt-1"
                    required
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="gender" className="medium-14">
                    Giới tính
                  </label>
                  <select
                    onChange={(e) => setGender(e.target.value)}
                    value={gender}
                    className="w-full px-3 py-1 ring-1 ring-slate-900/10 rounded bg-primary mt-1"
                    required
                  >
                    <option value="Male">Nam</option>
                    <option value="Female">Nữ</option>
                    <option value="Other">Khác</option>
                  </select>
                </div>
                <div className="w-full">
                  <label htmlFor="birth" className="medium-14">
                    Ngày sinh
                  </label>
                  <input
                    onChange={(e) => setBirth(e.target.value)}
                    value={birth}
                    type="date"
                    className="w-full px-3 py-1 ring-1 ring-slate-900/10 rounded bg-primary mt-1"
                    required
                  />
                </div>
              </>
            )}
            <div className="w-full">
              <label htmlFor="email" className="medium-14">
                Email
              </label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Email"
                className="w-full px-3 py-1 ring-1 ring-slate-900/10 rounded bg-primary mt-1"
                required
              />
            </div>
            <div className="w-full">
              <label htmlFor="password" className="medium-14">
                Mật khẩu
              </label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="Mật khẩu"
                className="w-full px-3 py-1 ring-1 ring-slate-900/10 rounded bg-primary mt-1"
                required
              />
            </div>
            <button type="submit" className="btn-dark w-full mt-5 !py-[7px] !rounded">
              {currState === "Đăng ký" ? "Đăng ký" : "Đăng nhập"}
            </button>
            <div className="w-full flex flex-col gap-y-3 medium-14 text-center">
              {currState === "Đăng nhập" ? (
                <>
                  <div className="underline">Quên mật khẩu?</div>
                  <div className="underline">
                    Chưa có tài khoản?{" "}
                    <span
                      onClick={() => setCurrState("Đăng ký")}
                      className="cursor-pointer hover:text-secondary"
                    >
                      Tạo tài khoản
                    </span>
                  </div>
                </>
              ) : (
                <div className="underline">
                  Đã có tài khoản?{" "}
                  <span
                    onClick={() => setCurrState("Đăng nhập")}
                    className="cursor-pointer hover:text-secondary"
                  >
                    Đăng nhập
                  </span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
