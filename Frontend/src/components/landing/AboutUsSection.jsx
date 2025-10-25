import React from 'react';

// Example data for About Us cards
const teamInfo = [
  {
    type: "image",
    // NEW LINK: Team working with puzzle pieces
    src: "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    alt: "Team collaboration on puzzle pieces"
  },
  {
    type: "text",
    title: "Our Vision for Collaboration",
    description: "Task Sphere empowers teams to connect, collaborate, and achieve their goals with unparalleled efficiency. We believe in simplicity, clarity, and innovation."
  },
  {
    type: "image",
    // NEW LINK: Smiling professional woman working on a laptop
    src: "https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    alt: "Smiling professional woman at work"
  },
  {
    type: "text",
    title: "Dedicated Support",
    description: "We are committed to providing outstanding support and continuously improving Task Sphere based on user feedback to ensure your success."
  },
];


/**
 * AboutUsSection
 * Displays information about the company/project with a mix of images and text.
 */
const AboutUsSection = () => {
  return (
    <section id="about-us" className="bg-white py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Section Heading */}
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
          About Us
        </h2>
        
        {/* Section Sub-text */}
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 mb-16">
          Task Sphere is built by a passionate team dedicated to simplifying project management and fostering seamless collaboration. We believe in tools that empower, not complicate.
        </p>

        {/* Content Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamInfo.map((item, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-transform hover:scale-105"
            >
              {item.type === "image" ? (
                <img 
                  src={item.src} 
                  alt={item.alt} 
                  className="w-full h-full object-cover object-center" 
                />
              ) : (
                <div className="p-6 text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default AboutUsSection;