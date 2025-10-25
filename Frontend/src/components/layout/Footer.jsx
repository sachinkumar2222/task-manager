import React from 'react';
import { Link } from 'react-router-dom';
// Icons for logo and social media
import { Zap, Twitter, Instagram, Facebook } from 'lucide-react';

/**
 * Footer
 * Simplified version with logo, social links, section links, and copyright.
 */
const Footer = () => {
  return (
    // Updated background to white and added top border
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"> {/* Adjusted padding */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">

          {/* Left Side: Logo and Social Icons */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Zap className="h-7 w-7 text-indigo-600" />
              <span>Task Sphere</span>
            </Link>
            {/* Social Icons */}
            <div className="flex space-x-4">
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Right Side: Navigation Links (Sections) */}
          <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-sm">
            <a href="/#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="/#projects" className="text-gray-600 hover:text-gray-900">Projects</a>
            <a href="/#tasks" className="text-gray-600 hover:text-gray-900">Tasks</a>
            <a href="/#testimonials" className="text-gray-600 hover:text-gray-900">Testimonials</a>
            <a href="/#about-us" className="text-gray-600 hover:text-gray-900">About Us</a>
            {/* You could add a 'Contact' link here if needed */}
            {/* <Link to="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link> */}
          </nav>

        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Task Sphere. All rights reserved.
        </div>

      </div>
    </footer>
  );
};

export default Footer;

