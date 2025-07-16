import { Link } from 'react-router-dom';

function Navbar() {
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white shadow-md py-4 sticky top-0 z-10">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">POS System</Link>
        <div className="space-x-4">
          {token ? (
            <>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-blue-600 transition duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className="text-gray-600 hover:text-blue-600 transition duration-300">Register</Link>
              <Link to="/login" className="text-gray-600 hover:text-blue-600 transition duration-300">Login</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;