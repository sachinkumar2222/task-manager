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
                <p className="text-sm text-gray-500">
                    Enter the email address of the person you want to invite to this workspace. They will receive instructions to join.
                </p>
                
                <div>
                    <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            id="inviteEmail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="colleague@example.com"
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
                    >
                        <Send size={16} />
                        {isLoading ? 'Sending...' : 'Send Invite'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default InviteMemberModal;