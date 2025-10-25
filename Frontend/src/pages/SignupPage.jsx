import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff } from 'lucide-react'; // Import Eye icons
import "../assets/index.css";
import toast from 'react-hot-toast'; // Import toast

// Import the SVG illustration (same as login page)
import taskIllustrationSvg from '../assets/images/task_management_signup.svg'; // Changed SVG name to match login

// Import the API function
import { signupUser } from '../api/authService';

/**
 * SignupPage
 * Displays the registration form for new users, matching the login page style.
 * Now connects to the backend. Includes show/hide password.
 */
const SignupPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setLoading(true);

    try {
      // Call the API function from authService
      await signupUser({ fullName, email, password });
      
      // Show success toast
      toast.success('Account created successfully!');
      
      // Redirect to login page after successful signup
      navigate('/login'); 

    } catch (err) {
      // Display error message from API call or a generic one
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      // Stop loading indicator regardless of success or failure
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 backgroundStyle">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left Side: SVG Illustration */}
        <div 
          className="relative hidden md:flex md:w-1/2 justify-center items-center p-8 lg:p-12 leftPanelGradientStyle"
        >
          {/* Bubbles */}
          <div className="absolute w-24 h-24 bg-gray-100 rounded-full opacity-30 top-10 left-10 animate-pulse"></div>
          <div className="absolute w-40 h-40 bg-gray-100 rounded-full opacity-20 bottom-16 right-16 animate-pulse-slow"></div>
          <div className="absolute w-16 h-16 bg-gray-100 rounded-full opacity-40 top-1/2 left-1/4 animate-pulse-medium"></div>
          <div className="absolute w-32 h-32 bg-gray-100 rounded-full opacity-25 bottom-10 left-10 animate-pulse-fast"></div>
          {/* SVG */}
          <img 
            src={taskIllustrationSvg} 
            alt="Person managing tasks" 
            className="relative z-10 max-w-full h-auto max-h-[28rem] drop-shadow-lg"
          />
        </div>

        {/* Right Side: Signup Form */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex items-center justify-center"> 
          <div className="max-w-md w-full space-y-8"> 
            {/* Header */}
            <div className="flex flex-col items-center">
              <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-gray-900 mb-6">
                <Zap className="h-7 w-7 text-indigo-600" />
                <span>Task Sphere</span>
              </Link>
              <h2 className="text-center text-3xl font-extrabold text-gray-900">
                Create your account
              </h2>
            </div>
            {/* Form */}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {/* --- INPUT FIELD STYLE UPDATED --- */}
              <div className="space-y-6">
                {/* Full Name Field */}
                <div>
                  <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full name
                  </label>
                  <input
                    id="full-name"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    className="appearance-none block w-full px-1 py-2 border-b border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-transparent"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                {/* Email Field */}
                <div>
                  <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-1 py-2 border-b border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-transparent"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {/* Password Field with Show/Hide Button */}
                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'} // Toggle input type
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full px-1 py-2 border-b border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-transparent pr-10" // Added padding-right
                    placeholder="•••••••• (min. 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {/* Show/Hide Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {/* --- END INPUT FIELD STYLE UPDATE --- */}

              {/* Error */}
              {error && (
                <div className="text-red-600 text-sm text-center pt-2">
                  {error}
                </div>
              )}
              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Creating account...' : 'Sign up'}
                </button>
              </div>
            </form>
            {/* Link to Login */}
            <div className="text-sm text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

