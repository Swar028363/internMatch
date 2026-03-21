import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Load users from localStorage or public/data
      let users = JSON.parse(localStorage.getItem('all_users') || '[]');
      if (users.length === 0) {
        // First time - load from public/data/users.json
        try {
          const response = await fetch('/data/users.json');
          users = await response.json();
          localStorage.setItem('all_users', JSON.stringify(users));
        } catch {
          users = [];
        }
      }

      // Find user by email
      const user = users.find((u: any) => u.email === email);
      
      if (!user || user.password !== password) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      const mockToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Call login to store in context and localStorage
      login(
        {
          id: user.id,
          email: user.email,
          role: user.role as 'applicant' | 'recruiter',
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          location: user.location || user.companyEmail,
        },
        mockToken
      );

      // Redirect based on role
      if (user.role === 'recruiter') {
        navigate('/dashboard/recruiter');
      } else {
        navigate('/dashboard/student');
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-8">
        
        <h1 className="text-2xl font-semibold text-gray-900">
          Login
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Please enter your login details.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Test: swar@gmail.com (student) or samarth@gmail.com (recruiter)
            </p>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              minLength={8}
              required
            />

            {/* Show Password Checkbox */}
            <div className="mt-2 flex items-center">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="mr-2"
              />
              <label htmlFor="showPassword" className="text-sm text-gray-600">
                Show Password
              </label>
            </div>

            {/* Password Requirement Hint */}
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 8 characters.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Register
          </Link>
        </p>

      </div>
    </main>
  );
}
