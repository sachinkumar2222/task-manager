import React from 'react';
import { Link } from 'react-router-dom';
// Import your bubble.svg file
import bubbleSvg from '../../assets/images/bubble.svg';
import "../../assets/index.css"

const HeroSection = () => {
  // Define the style object for the radial gradient background

  return (
    // Apply the gradient style directly to this section
    // Added overflow-hidden to contain the gradient visually
    <section 
      className="relative z-10 overflow-hidden backgroundStyle" 
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Responsive grid: 1 column on mobile, 2 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 py-24 md:py-32">
          
          {/* Left Side: Text Content */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Bring all your work together!
            </h1>
            <p className="mt-5 max-w-md mx-auto text-lg text-gray-600 md:mx-0 md:max-w-xl">
              The best way for content creators to make money and connect with the audience
            </p>
            {/* Call to Action Button */}
            <div className="mt-8 flex justify-center md:justify-start">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 shadow-lg transition-transform transform hover:scale-105"
              >
                Start your creator page
              </Link>
            </div>
          </div>

          {/* Right Side: Image */}
        <div className="hidden md:flex items-center justify-center">
            <img 
              src={bubbleSvg} 
              className="w-full max-w-md md:max-w-lg" 
              alt="Illustration of lightbulbs" 
            />
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

