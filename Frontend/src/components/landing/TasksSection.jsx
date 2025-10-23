import React from 'react';
// Example task list image (replace with your actual screenshot URL or import)
const taskListImage = 'https://placehold.co/600x400/E2E8F0/A0AEC0?text=Task+List+Screenshot'; 

/**
 * TasksSection
 * Displays a section highlighting task management features.
 */
const TasksSection = () => {
  return (
    // Section uses a light background
    <section id='tasks' className="bg-white py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading (Centered) */}
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl text-center mb-16">
          Tasks
        </h2>

        {/* Card-like container for the content */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-8 md:p-12 lg:p-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Left Side: Image */}
            <div className="flex justify-center">
              <img 
                src={taskListImage} 
                alt="Task list interface" 
                className="rounded-lg shadow-md w-full max-w-lg" // Added styling
              />
            </div>

            {/* Right Side: Text Content */}
            <div className="text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Let's make your tasks clear
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Break down large projects into manageable steps. Assign tasks, set deadlines, and track progress effortlessly. Task Sphere provides the clarity you need to keep your team focused and productive, ensuring nothing falls through the cracks.
              </p>
              {/* Optional: Add a button or link here if needed */}
              {/* <button className="mt-6 ...">Learn More</button> */}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default TasksSection;
