import React, { useEffect } from 'react';
import { X } from 'lucide-react'; // Icon for close button

/**
 * Reusable Modal Component
 * * Props:
 * - isOpen: boolean - Controls whether the modal is visible.
 * - onClose: function - Function to call when the modal should be closed.
 * - title: string (optional) - The title displayed in the modal header.
 * - children: ReactNode - The content to display inside the modal body.
 * - size: string (optional) - Tailwind max-width class (e.g., 'max-w-md', 'max-w-xl', 'max-w-3xl'). Defaults to 'max-w-lg'.
 */
const Modal = ({ isOpen, onClose, title, children, size = 'max-w-lg' }) => {
  // Effect to handle Escape key press for closing the modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    // Cleanup listener on component unmount or when modal closes
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Effect to prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup style on component unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // If modal is not open, render nothing
  if (!isOpen) {
    return null;
  }

  return (
    // Fixed position overlay covering the whole screen
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose} // Close modal when clicking on the overlay
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Content Box */}
      {/* Stop propagation prevents closing modal when clicking inside the content */}
      <div 
        className={`bg-white rounded-lg shadow-xl overflow-hidden transform transition-all duration-300 ease-in-out w-full ${size}`}
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {title && (
            <h2 id="modal-title" className="text-lg font-semibold text-gray-800">
              {title}
            </h2>
          )}
          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]"> {/* Added max-height and scroll */}
          {children}
        </div>
        
        {/* Optional: Modal Footer (can be added via children or separate prop) */}
        {/* <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="...">Cancel</button>
          <button className="...">Save</button>
        </div> */}
      </div>
    </div>
  );
};

export default Modal;
