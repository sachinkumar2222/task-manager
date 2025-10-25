import React, { useState, useEffect } from 'react'; // useState aur useEffect import karein
import { Outlet, Link } from 'react-router-dom';
import Footer from './Footer';
// Icons import karein
import { Zap, ArrowUp } from 'lucide-react'; 

/**
 * PublicLayout
 * Ab ismein ek "Scroll to Top" button bhi hai.
 */
const PublicLayout = () => {
  // State to track whether the scroll-to-top button should be visible
  const [isVisible, setIsVisible] = useState(false);

  // Function to scroll the window back to the top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Smooth scrolling ke liye
    });
  };

  // Effect to add/remove scroll event listener
  useEffect(() => {
    // Function to check scroll position
    const toggleVisibility = () => {
      // Agar user 300px se zyada scroll kar chuka hai, to button dikhao
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Scroll event listener add karo
    window.addEventListener('scroll', toggleVisibility);

    // Cleanup function: Component unmount hone par listener remove karo
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []); // Empty dependency array means this effect runs only once on mount

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* Scrollable Header/Navbar */}
      <header className="absolute top-0 left-0 right-0 z-50 w-full"> 
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20"> 
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Zap className="h-7 w-7 text-indigo-600" /> 
              <span>Task Sphere</span>
            </Link>
            {/* Nav Links */}
            <nav className="hidden md:flex gap-8 items-center">
              <a href="/#features" className="text-sm font-medium text-gray-700 hover:text-gray-900">Features</a>
              <a href="/#projects" className="text-sm font-medium text-gray-700 hover:text-gray-900">Projects</a>
              <a href="/#tasks" className="text-sm font-medium text-gray-700 hover:text-gray-900">Tasks</a>
              <a href="/#testimonials" className="text-sm font-medium text-gray-700 hover:text-gray-900">Users</a> 
              <a href="/#about-us" className="text-sm font-medium text-gray-700 hover:text-gray-900">About Us</a>
            </nav>
            {/* Login Button */}
            <div className="flex items-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-gray-800 bg-transparent border border-gray-400 rounded-full hover:bg-gray-100/50 transition-colors" 
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* --- YEH NAYA BUTTON HAI --- */}
      {/* Scroll to Top Button */}
      {isVisible && ( // Button sirf tabhi dikhega jab isVisible true hoga
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-opacity duration-300"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default PublicLayout;

