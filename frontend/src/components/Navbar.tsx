import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import { DefaultAvatar } from './DefaultAvatar'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
    navigate('/')
  }

  const getInitials = () => {
    if (!user) return 'U'
    const parts = user.email.split('@')[0].split('.')
    return (parts[0]?.charAt(0) ?? 'U').toUpperCase() +
      (parts[1]?.charAt(0) ?? '').toUpperCase()
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">

        <Link to="/" className="text-lg font-semibold text-gray-900">
          InternMatch
        </Link>

        <nav className="flex gap-6">
          <Link to="/" className="text-lg text-gray-600 hover:text-gray-900">Home</Link>
          {user?.role !== 'recruiter' && (
            <Link to="/explore" className="text-lg text-gray-600 hover:text-gray-900">
            Explore
            </Link>)}
          {isAuthenticated && user?.role === 'applicant' && (
            <Link to="/dashboard/student" className="text-lg text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
          )}
          {isAuthenticated && user?.role === 'recruiter' && (
            <Link to="/dashboard/recruiter" className="text-lg text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
          )}
          <Link to="/about" className="text-lg text-gray-600 hover:text-gray-900">About Us</Link>
          <Link to="/contact" className="text-lg text-gray-600 hover:text-gray-900">Contact Us</Link>
        </nav>

        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="text-lg text-gray-600 hover:text-gray-900">Login</Link>
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
                    <p className="font-semibold text-gray-900 truncate text-sm">
                      {user?.email?.toLowerCase()}
                    </p>
                  </div>
                  <Link
                    to="/account"
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-2 hover:bg-gray-100 text-gray-900 transition text-sm"
                  >
                    Profile
                  </Link>
                  {user?.role === 'applicant' && (
                    <Link
                      to="/dashboard/student"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 hover:bg-gray-100 text-gray-900 transition text-sm"
                    >
                      Dashboard
                    </Link>
                  )}
                  {user?.role === 'recruiter' && (
                    <Link
                      to="/dashboard/recruiter"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 hover:bg-gray-100 text-gray-900 transition text-sm"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 font-medium transition border-t border-gray-200 text-sm"
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
  )
}