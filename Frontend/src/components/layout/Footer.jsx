import React from 'react';
import { Link } from 'react-router-dom';
// Icons for logo and social media
import { Zap, Twitter, Instagram, Facebook } from 'lucide-react';

/**
 * Footer
 * Updated to match the multi-column design from the image.
 */
const Footer = () => {
  return (
    // Updated background to white and added top border
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16"> {/* Increased padding */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

          {/* Column 1: Logo and Social Icons */}
          <div className="md:col-span-2 flex flex-col items-start space-y-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Zap className="h-7 w-7 text-indigo-600" />
              <span>Task Sphere</span>
            </Link>
            {/* Social Icons */}
            <div className="flex space-x-4 mt-2">
              <a href="#" className="text-gray-500 hover:text-gray-700">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
            </div>
            {/* Copyright - Moved to bottom later */}
          </div>

          {/* Column 2: Company Links */}
          <div className="text-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Pricing</a></li>
              <li><a href="/#about-us" className="text-gray-600 hover:text-gray-900">About</a></li>
            </ul>
          </div>

          {/* Column 3: Portfolio Links */}
          <div className="text-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Portfolio</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Templates</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Plugins</a></li>
            </ul>
          </div>

          {/* Column 4: Connect Links */}
          <div className="text-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Connect and ask</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Consulting</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Support</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Contact</a></li>
            </ul>
          </div>

          {/* Column 5: FAQs Links */}
          <div className="text-sm">
            <h3 className="font-semibold text-gray-900 mb-3">FAQs</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-gray-900">All FAQs</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Our process</a></li>
            </ul>
          </div>

        </div>

        {/* Copyright - Moved here for better structure */}
        <div className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Task Sphere. All rights reserved.
        </div>

      </div>
    </footer>
  );
};

export default Footer;

