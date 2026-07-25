import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      const res = await api.post('/api/auth/login', data);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      setUser(res.data.user);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.data?.errors) {
        setServerError(err.response.data.errors.map(e => e.msg).join(', '));
      } else if (err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setServerError(err.response.data.error);
      } else {
        setServerError('Network error. Unable to connect to backend server. Please check your network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 text-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Log In</h1>
          <p className="text-zinc-500 text-sm font-medium">
            Access your unlocked exam prep courses
          </p>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3.5 rounded-xl font-medium">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Please enter a valid email'
                }
              })}
              placeholder="you@college.edu"
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white text-sm transition-all placeholder-zinc-400 font-medium"
            />
            {errors.email && (
              <p className="text-red-600 text-xs mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                }
              })}
              placeholder="••••••••"
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white text-sm transition-all placeholder-zinc-400 font-medium"
            />
            {errors.password && (
              <p className="text-red-600 text-xs mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 hover:bg-black disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-sm transition-all active:scale-[0.98] mt-2"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500 font-medium">
          Don't have an account?{' '}
          <Link to="/signup" className="text-zinc-900 font-bold hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
