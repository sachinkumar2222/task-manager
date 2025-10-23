import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
// Naye ProjectsSection ko import karein
import ProjectsSection from '../components/landing/ProjectsSection'; 
import TasksSection from '../components/landing/TasksSection';
import TestimonialsSection from '../components/landing/Testimonials';
import AboutUsSection from '../components/landing/AboutUsSection';
// import Testimonials from '../components/landing/Testimonials'; // Isse hum baad mein add kar sakte hain

/**
 * LandingPage
 * Application ka main public homepage.
 * Yeh alag-alag landing sections ko ek saath jodta hai.
 */
const LandingPage = () => {
  return (
    <div>
      {/* Hero Section (Gradient Background ke saath) */}
      <HeroSection />

      {/* Features Section (White Background ke saath) */}
      <FeaturesSection />

      {/* --- YEH NAYA SECTION HAI --- */}
      {/* Projects Section (Dark Background ke saath) */}
      <ProjectsSection />

      <TasksSection />

      {/* Aap yahan future mein aur sections add kar sakte hain (e.g., Testimonials) */}
      <TestimonialsSection />

      <AboutUsSection/>
      
    </div>
  );
};

export default LandingPage;

