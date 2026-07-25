import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav className="bg-zinc-100/80 backdrop-blur-md border-b border-zinc-300/80 sticky top-0 z-50 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-xl font-black tracking-tight text-zinc-900 group-hover:text-black transition-colors">
              PassKaro
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-900"></span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-zinc-700 hover:text-zinc-900 text-sm font-bold transition-colors"
            >
              Find College
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1 rounded-xl text-sm font-bold transition-all"
              >
                Admin Panel
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs text-zinc-900 font-bold bg-white px-3 py-1.5 rounded-full border border-zinc-300 shadow-2xs flex items-center space-x-1.5">
                  <span>{user.name}</span>
                  {user.role === 'admin' && (
                    <span className="text-[10px] bg-zinc-900 text-white font-mono uppercase px-1.5 py-0.5 rounded font-bold">
                      Admin
                    </span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold bg-zinc-900 hover:bg-black text-white px-4 py-1.5 rounded-lg shadow-sm transition-all active:scale-95"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-bold text-zinc-900 bg-white hover:bg-zinc-50 border border-zinc-300 px-3.5 py-1.5 rounded-xl shadow-2xs transition-all active:scale-95"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-bold bg-zinc-900 hover:bg-black text-white px-4.5 py-2 rounded-xl shadow-md transition-all active:scale-95 ring-1 ring-zinc-900/10"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
