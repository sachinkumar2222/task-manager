import React from 'react';
import "../../assets/index.css"

// Example Testimonial Data (aap ise baad mein update kar sakte hain)
const testimonials = [
  {
    quote: "Task Sphere has completely transformed how our team manages projects. Deadlines are consistently met, and collaboration has never been smoother!",
    author: "Alice Johnson",
    title: "CEO, Creative Solutions",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg" // Random placeholder avatar
  },
  {
    quote: "The intuitive interface and powerful features of Task Sphere have made it indispensable for our workflow. Highly recommend!",
    author: "Bob Williams",
    title: "Lead Developer, Tech Innovations",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg" // Random placeholder avatar
  },
  {
    quote: "Task Sphere is a game-changer for cross-functional teams. It brings clarity and efficiency to every project, big or small.",
    author: "Carol White",
    title: "Marketing Director, Global Brands",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg" // Random placeholder avatar
  }
];

/**
 * TestimonialsSection
 * Displays testimonials from happy users.
 */
const TestimonialsSection = () => {

  return (
    <section id="testimonials" className="py-20 sm:py-28 overflow-hidden backgroundStyle">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Section Heading */}
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-16">
          What Our Users Say
        </h2>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl shadow-xl p-8 transform transition-transform hover:scale-105 flex flex-col items-center text-center"
            >
              {/* Quote Icon (Optional) */}
              <svg className="h-8 w-16 text-indigo-600 mb-4" fill="currentColor" viewBox="0 0 36 24">
                <circle cx="14" cy="12" r="3" />
                <circle cx="21" cy="12" r="3" />
              </svg>

              {/* Testimonial Quote */}
              <p className="text-gray-700 text-lg mb-6 italic">"{testimonial.quote}"</p>

              {/* Author Info */}
              <div className="flex flex-col items-center">
                {testimonial.avatar && (
                  <img src={testimonial.avatar} alt={testimonial.author} className="w-12 h-12 rounded-full mb-3 border-2 border-indigo-300" />
                )}
                <p className="font-semibold text-gray-900">{testimonial.author}</p>
                <p className="text-sm text-gray-500">{testimonial.title}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
