import React from 'react';
import { Briefcase, CheckCircle, MessageSquare, Users, LayoutDashboard} from 'lucide-react';

// Ek helper component taaki humein code repeat na karna pade
const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center p-6 text-center bg-white rounded-lg shadow-lg transition-transform transform hover:-translate-y-2">
      <div className="flex items-center justify-center w-16 h-16 mb-4 text-white bg-indigo-600 rounded-full">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

/**
 * FeaturesSection
 * Yeh component aapke screenshot ke "Features" section ko banata hai.
 * Hum yahan 'lucide-react' se sundar icons ka istemaal kar rahe hain.
 */
const FeaturesSection = () => {
  const features = [
    {
      icon: <Briefcase size={28} />,
      title: 'Projects Hub',
      description: 'Manage all your projects from a single, centralized dashboard.',
    },
    {
      icon: <CheckCircle size={28} />,
      title: 'Task Tracking',
      description: 'Create, assign, and track tasks with our intuitive Kanban boards.',
    },
    {
      icon: <MessageSquare size={28} />,
      title: 'Real-time Chat',
      description: 'Collaborate with your team instantly with built-in discussions on every task.',
    },
    {
      icon: <Users size={28} />,
      title: 'Team Management',
      description: 'Invite members, assign roles, and manage your entire team seamlessly.',
    },
    {
      icon: <LayoutDashboard size={28} />,
      title: 'Analytics Dashboard',
      description: 'Get real-time insights into your team\'s productivity and project progress.',
    },
    {
      icon: <Briefcase size={28} />,
      title: 'File Attachments',
      description: 'Securely attach files from your computer or cloud storage directly to tasks.',
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Everything you need. All in one place.
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Task Sphere is built from the ground up to support modern teams.
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

