import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    userType: "applicant",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = () => {
    // Required fields
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      return "All fields are required.";
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Enter a valid email address.";
    }

    // Password length
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters.";
    }

    // Password match
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Load users from localStorage
      let users = JSON.parse(localStorage.getItem('all_users') || '[]');
      if (users.length === 0) {
        // First time - load from public/data/users.json
        try {
          const response = await fetch('/data/users.json');
          users = await response.json();
        } catch {
          users = [];
        }
      }

      // Check if email already exists
      if (users.some((u: any) => u.email === formData.email)) {
        setError("Email already registered");
        setLoading(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email: formData.email,
        password: formData.password,
        role: formData.userType,
        firstName: "",
        lastName: "",
        ...(formData.userType === 'applicant' ? {
          phone: "",
          location: "",
          education: "",
          skills: [],
          bio: ""
        } : {
          phone: "",
          company: "",
          companyPosition: "",
          companyEmail: ""
        })
      };

      // Add to users list
      users.push(newUser);
      localStorage.setItem('all_users', JSON.stringify(users));

      const mockToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Call login to store in context and localStorage
      login(
        {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role as 'applicant' | 'recruiter',
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
        mockToken
      );

      // Redirect based on role
      if (formData.userType === 'recruiter') {
        navigate('/dashboard/recruiter');
      } else {
        navigate('/dashboard/student');
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-8">

        <h1 className="text-2xl font-semibold text-gray-900">
          Create Account
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Fill in the details to register.
        </p>

        {/* Error Box (Same Style as Login) */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-800 rounded">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Re-enter password"
            />
          </div>

          {/* Show Password */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">
              Show Password
            </span>
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Account Type
            </label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="applicant">Student</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Login
          </Link>
        </p>

      </div>
    </main>
  );
}
