import { useNavigate } from 'react-router-dom';

function Dashboard({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Marukawa Cement</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Welcome, {user?.name} ({user?.role})
            </span>
            {user?.role === 'customer' && (
              <button
                onClick={() => navigate('/customer/profile')}
                className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700 hover:bg-gray-300"
                title="View profile"
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">
            {user?.role === 'customer' && 'Customer Dashboard'}
            {user?.role === 'admin' && 'Admin Dashboard'}
            {user?.role === 'staff' && 'Staff Dashboard'}
            {user?.role === 'storekeeper' && 'Storekeeper Dashboard'}
          </h2>

          {user?.role === 'customer' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Browse Products</h3>
                <p className="text-gray-600">View our cement product catalog</p>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">My Orders</h3>
                <p className="text-gray-600">Track your order status</p>
              </div>
            </div>
          )}

          {user?.role === 'admin' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Manage Products</h3>
                <p className="text-gray-600">Add, edit, or remove products</p>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Manage Orders</h3>
                <p className="text-gray-600">View and process all orders</p>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Inventory</h3>
                <p className="text-gray-600">Track stock levels</p>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Schedule Orders</h3>
                <p className="text-gray-600">Assign tasks to workers</p>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Analytics</h3>
                <p className="text-gray-600">View business progress</p>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Alerts</h3>
                <p className="text-gray-600">Low stock notifications</p>
              </div>
            </div>
          )}

          {user?.role === 'staff' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">My Tasks</h3>
                <p className="text-gray-600">View assigned tasks</p>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Update Orders</h3>
                <p className="text-gray-600">Update order status</p>
              </div>
            </div>
          )}

          {user?.role === 'storekeeper' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Inventory Management</h3>
                <p className="text-gray-600">Track and update stock</p>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Send Alerts</h3>
                <p className="text-gray-600">Notify admin of low stock</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;