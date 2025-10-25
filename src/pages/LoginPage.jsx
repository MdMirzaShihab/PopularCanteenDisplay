import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!credentials.username) {
      error('Please enter a username or email');
      return;
    }

    const result = login(credentials);
    if (result.success) {
      success(`Welcome back, ${result.user.name}!`);
      navigate('/dashboard');
    } else {
      error('Login failed. Please try again.');
    }
  };

  const handleDemoLogin = (role) => {
    let demoCredentials;
    if (role === 'admin') {
      demoCredentials = { username: 'admin', password: 'admin123' };
    } else if (role === 'operator') {
      demoCredentials = { username: 'operator', password: 'operator123' };
    } else {
      demoCredentials = { username: 'manager', password: 'manager123' };
    }

    setCredentials(demoCredentials);
    const result = login(demoCredentials);
    if (result.success) {
      success(`Logged in as ${result.user.name}!`);
      // Token operators go directly to token page, others to dashboard
      navigate(role === 'operator' ? '/token' : '/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center p-6">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Logo & Title */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-white rounded-2xl shadow-lg mb-6">
            <img
              src="/src/assets/Ref/PopularHospitalLogo.png"
              alt="Popular Medical College Hospital"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Popular Medical College Hospital</h1>
          <p className="text-2xl font-semibold text-white mb-2">Canteen Management System</p>
          <p className="text-bg-100 text-lg">Demo Version - Client Presentation</p>
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

          {/* Demo Credentials */}
          <div className="mt-4 pt-4 border-t border-bg-300">
            <p className="text-sm font-medium text-text-100 mb-2">Demo Accounts:</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="w-full px-3 py-2 text-sm bg-bg-100 text-text-100 rounded-lg hover:bg-bg-200 transition-colors text-left"
              >
                <div className="font-medium">Admin Account</div>
                <div className="text-xs text-text-200">admin / admin123</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('manager')}
                className="w-full px-3 py-2 text-sm bg-bg-100 text-text-100 rounded-lg hover:bg-bg-200 transition-colors text-left"
              >
                <div className="font-medium">Restaurant Manager</div>
                <div className="text-xs text-text-200">manager / manager123</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('operator')}
                className="w-full px-3 py-2 text-sm bg-bg-100 text-text-100 rounded-lg hover:bg-bg-200 transition-colors text-left"
              >
                <div className="font-medium">Token Operator</div>
                <div className="text-xs text-text-200">operator / operator123</div>
              </button>
            </div>
          </div>

          {/* Note */}
          <div className="mt-4 p-3 bg-bg-200 rounded-lg">
            <p className="text-xs text-text-100">
              <strong>Note:</strong> This is a demo application with pre-configured data.
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-text-200 text-xs mt-4">
            Built by <span className='font-bold'> Ali Automations </span> 
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
