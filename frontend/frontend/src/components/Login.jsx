import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// Login component:
// - Props: `setUser(user)` : callback to lift authenticated user into app state
// - Submits `POST ${API_URL}/auth/login` with `{ email, password }`
// - On success stores `token` and `user` in `localStorage`, calls `setUser`, then navigates to `/dashboard`
const API_URL = 'http://localhost:5000/api';

function Login({ setUser }) {
  const navigate = useNavigate();
  // `formData` holds controlled input values for the login form
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  // `error` shows server/validation messages; `loading` disables the form while request runs
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    // Update the named field in formData (works for inputs with `name` attr)
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Send credentials to backend; expect `{ token, user }` on success
      const response = await axios.post(`${API_URL}/auth/login`, formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Lift authenticated user to parent context and navigate to protected area
      setUser(response.data.user);
      navigate('/dashboard');
    } catch (err) {
      // Show server error message if available, otherwise a generic message
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400">{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <p className="mt-4 text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-500 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;