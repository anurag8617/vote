import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "/api/auth/login", 
        {
          username,
          password,
        }
      );

      const { token } = response.data;
      onLoginSuccess(token);
      navigate("/admin"); // Redirect to the admin panel
    } catch (err) {
      setError("❌ Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50">
      <div className="mb-8 text-center">
        <Link to="/" className="text-3xl font-bold text-blue-600">
          PollPulse
        </Link>
        <p className="text-gray-500">Admin Portal</p>
      </div>
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 border-t-4 border-blue-600">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Admin Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              placeholder="Enter your username"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm font-medium text-center bg-red-100 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-lg transition-all duration-200 ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
