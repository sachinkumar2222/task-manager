import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { acceptInvite } from '../api/authService'; // API function
import { Zap, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import "../assets/index.css";

/**
 * AcceptInvitePage
 * This page handles the user joining a workspace via an invitation link.
 * It captures the token from the URL query parameters.
 */
const AcceptInvitePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token'); // Get token from URL (?token=...)

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if no token is present
  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link. No token provided.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      toast.error('Invalid invitation link.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      // Call the API to accept the invite
      const response = await acceptInvite({ token, fullName, password });
      
      toast.success('Welcome to the workspace! Please log in.');
      
      // Redirect to login page
      navigate('/login');

    } catch (err) {
      console.error('Accept invite error:', err);
      setError(err.message || 'Failed to accept invitation. Link might be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  // Styling (Reuse login/signup styles)
  const pageStyle = {
    background: 'radial-gradient(at 10% 10%, rgb(223, 228, 254), rgb(190, 243, 254), rgb(204, 243, 220))',
  };
  const leftPanelGradientStyle = {
    background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.9), rgba(165, 180, 252, 0.9), rgba(199, 210, 254, 0.9))',
  };

  if (!token) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                  <h2 className="text-2xl font-bold text-red-600 mb-2">Invalid Invitation</h2>
                  <p className="text-gray-600 mb-4">This link is missing a valid invitation token.</p>
                  <Link to="/" className="text-indigo-600 hover:underline">Go Home</Link>
              </div>
          </div>
      );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8" style={pageStyle}>
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left Side: Info */}
        <div 
          className="relative hidden md:flex md:w-1/2 justify-center items-center p-8 lg:p-12 text-white"
          style={leftPanelGradientStyle}
        >
            <div className="z-10 text-center">
                <h2 className="text-3xl font-bold mb-4">Join Your Team</h2>
                <p className="text-lg opacity-90">
                    You've been invited to collaborate on Task Master. 
                    Create your account to start working together.
                </p>
            </div>
             {/* Decor bubbles */}
             <div className="absolute w-32 h-32 bg-white rounded-full opacity-10 top-10 left-10"></div>
             <div className="absolute w-48 h-48 bg-white rounded-full opacity-10 bottom-10 right-10"></div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex items-center justify-center">
          <div className="max-w-md w-full space-y-8">
            <div className="flex flex-col items-center">
              <Zap className="h-8 w-8 text-indigo-600 mb-2" />
              <h2 className="text-center text-2xl font-bold text-gray-900">
                Set up your account
              </h2>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    className="appearance-none block w-full px-1 py-2 border-b border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-transparent"
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Choose Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="appearance-none block w-full px-1 py-2 border-b border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-transparent pr-10"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center pt-2">{error}</div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Joining Workspace...' : 'Join Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitePage;