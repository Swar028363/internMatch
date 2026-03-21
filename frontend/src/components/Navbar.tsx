import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { DefaultAvatar } from "./DefaultAvatar";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/");
  };

  const getInitials = () => {
    const firstName = localStorage.getItem('profile_firstName') || user?.email?.charAt(0).toUpperCase() || 'U';
    const lastName = localStorage.getItem('profile_lastName') || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        
        {/* Left: Logo / Name */}
        <Link to="/" className="text-lg font-semibold text-gray-900">
          InternMatch
        </Link>

        {/* Middle: Navigation */}
        <nav className="flex gap-6">
          <Link to="/" className="text-lg text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link to="/explore" className="text-lg text-gray-600 hover:text-gray-900">
            Explore
          </Link>
          <Link to="/about" className="text-lg text-gray-600 hover:text-gray-900">
            About Us
          </Link>
          <Link to="/contact" className="text-lg text-gray-600 hover:text-gray-900">
            Contact Us
          </Link>
        </nav>

        {/* Right: Auth Links */}
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="text-lg text-gray-600 hover:text-gray-900"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="text-lg font-medium px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition"
                title={user?.email}
              >
                <DefaultAvatar size="sm" initials={getInitials()} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm text-gray-600">Signed in as</p>
                    <p className="font-semibold text-gray-900 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/account"
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-2 hover:bg-gray-100 text-gray-900 transition"
                  >
                    Profile
                  </Link>
                  {user?.role === 'applicant' && (
                    <Link
                      to="/dashboard/student"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 hover:bg-gray-100 text-gray-900 transition"
                    >
                      Dashboard
                    </Link>
                  )}
                  {user?.role === 'recruiter' && (
                    <Link
                      to="/dashboard/recruiter"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 hover:bg-gray-100 text-gray-900 transition"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 font-medium transition border-t border-gray-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
