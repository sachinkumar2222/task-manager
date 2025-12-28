import React, { useState } from 'react';
import Modal from '../common/Modal'; // Reusable Modal
import { sendInvite } from '../../api/authService'; // API function
import toast from 'react-hot-toast';
import { Mail, Send } from 'lucide-react';

const InviteMemberModal = ({ isOpen, onClose, workspaceId }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error("Please enter an email address.");
            return;
        }

        setIsLoading(true);
        try {
            await sendInvite(workspaceId, email);
            toast.success(`Invitation sent to ${email}!`);
            setEmail(''); // Reset form
            onClose(); // Close modal
        } catch (error) {
            toast.error(error.message || "Failed to send invitation.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Invite Team Member" size="max-w-md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Enter the email address of the person you want to invite to this workspace. They will receive instructions to join.
                </p>

                <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address
                    </label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            id="email"
                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md py-2 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                            placeholder="colleague@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>Sending...</>
                        ) : (
                            <>
                                <Send size={16} /> Send Invite
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default InviteMemberModal;