import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { hospitalLogo } from '../assets';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error } = useNotification();

  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.username) {
      error('Please enter a username or email');
      return;
    }

    try {
      const data = await login(credentials);
      success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      error(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center p-6">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Logo & Title */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-white rounded-2xl shadow-lg mb-6">
            <img
              src={hospitalLogo}
              alt="Popular Medical College Hospital"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Popular Medical College Hospital</h1>
          <p className="text-2xl font-semibold text-white mb-2">Food Display System</p>
          <p className="text-bg-100 text-lg">Canteen Management Portal</p>
        </div>

        {/* Right Side - Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-text-100 mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="input-label">
                Username or Email
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your username"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-100 text-white font-medium rounded-lg hover:bg-primary-200 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
