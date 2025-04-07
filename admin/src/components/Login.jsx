import loginImg from '../assets/login.png';
import { backend_url } from '../App.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useState } from 'react';

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Vui lòng nhập email và mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${backend_url}/api/user/admin`, { email, password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
        toast.success('Đăng nhập thành công');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Có gì đó không ổn. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <section className='absolute top-0 left-0 h-full w-full'>
      <div className='flex h-full w-full'>
        <div className='w-1/2 hidden sm:block'>
          <img src={loginImg} alt='Login Illustration' className='object-cover h-full w-full' />
        </div>
        <div className='flexCenter w-full sm:w-1/2'>
          <form
            onSubmit={onSubmitHandler}
            className='flex flex-col items-center w-[90%] sm:max-w-md m-auto gap-y-5 text-gray-800'
          >
            <div className='w-full mb-4'>
              <h3 className='bold-36'>Admin</h3>
            </div>
            <div className='w-full'>
              <label htmlFor="email" className='medium-15'>
                Email
              </label>
              <input
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type='email'
                placeholder='Email'
                className='w-full px-3 py-1 ring-1 ring-slate-900/10 rounded bg-primary mt-1'
              />
            </div>
            <div className='w-full'>
              <label htmlFor="password" className='medium-15'>
                Mật khẩu
              </label>
              <input
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type='password'
                placeholder='Mật khẩu'
                className='w-full px-3 py-1 ring-1 ring-slate-900/10 rounded bg-primary mt-1'
              />
            </div>
            <button
              type='submit'
              className={`btn-dark w-full mt-5 !py-[7px] !rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
