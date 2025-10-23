import React from 'react';

// Example project data updated for Task Sphere in English
const projects = [
  { title: "Website Redesign Launch", description: "Coordinate all tasks for the new website release." },
  { title: "Q4 Marketing Plan", description: "Execute digital marketing strategy for Q4." },
  { title: "Mobile App Beta Test", description: "Manage beta testing phase and gather feedback." },
  { title: "User Onboarding Flow", description: "Improve the signup and first-time user experience." },
  { title: "API Documentation", description: "Write and publish comprehensive API docs." },
  { title: "Team Offsite Planning", description: "Organize the annual company team offsite event." },
];

/**
 * ProjectsSection
 * Displays a section highlighting project examples, styled according to the image.
 */
const ProjectsSection = () => {
  return (
    // Updated background to black
    <section id="projects" className="bg-black py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Section Heading */}
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Projects
        </h2>
        
        {/* Section Sub-heading - UPDATED CONTENT */}
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
          See how Task Sphere helps teams manage everything from complex product launches to cross-functional initiatives. Keep track of progress, deadlines, and collaboration all in one place.
        </p>

        {/* Project Cards Grid */}
        <div className="mt-16 grid grid-cols-1 gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            // Added a container for the dot and the card
            <div key={index} className="flex flex-col items-center">
             <div className="w-4 h-4 bg-blue-200 rounded-full mb-[-0.5rem] z-10 shadow-md"></div> 
              {/* Card - Updated styles */}
              <div 
                className="bg-white rounded-3xl shadow-md p-8 w-full text-center transform transition-transform hover:scale-105" // Updated: rounded-3xl, shadow-md, p-8, text-center
              >
                {/* Title - Updated styles */}
                <h3 className="text-xl font-bold text-gray-900">{project.title}</h3> 
                {/* Description - Updated styles */}
                <p className="mt-2 text-sm text-gray-500">{project.description}</p> 
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default ProjectsSection;

