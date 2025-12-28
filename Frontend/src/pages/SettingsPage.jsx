import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserCircle, Moon, Sun, Mail, User, Camera, Save, Lock } from 'lucide-react';
import { updateProfile } from '../api/authService';
import toast from 'react-hot-toast';

const SettingsPage = () => {
    const { currentUser, setCurrentUser } = useAuth(); // Assuming setCurrentUser is available to update context
    const { theme, toggleTheme } = useTheme();

    // Form State
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFullName(currentUser.fullName || '');
            setPreviewImage(currentUser.profileImage || null);
        }
    }, [currentUser]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('fullName', fullName);

            if (password) {
                if (!oldPassword) {
                    toast.error('Please enter your old password to change it.');
                    setLoading(false);
                    return;
                }
                formData.append('password', password);
                formData.append('oldPassword', oldPassword);
            }
            // If old password is typed but new password isn't, we probably shouldn't send anything regarding passwords,
            // or maybe correct the user flow. Current logic only sends if new password is set. OK.

            if (profileImage) {
                formData.append('profileImage', profileImage);
            }

            const data = await updateProfile(formData);

            if (data.user) {
                // Update local context
                // You might need a way to update the user in AuthContext. 
                // If setCurrentUser is exposed from useAuth, this works.
                // Otherwise, you might need to reload or re-fetch.
                if (setCurrentUser) {
                    setCurrentUser(prev => ({ ...prev, ...data.user }));
                }

                toast.success('Profile updated successfully!');
                setPassword(''); // Clear password field
                setOldPassword(''); // clear old password field
            }
        } catch (error) {
            console.error('Update Error:', error);
            toast.error(error.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>

            {/* Profile Section */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                    <UserCircle className="w-6 h-6 text-indigo-500" />
                    Profile Information
                </h2>

                <div className="space-y-6">
                    {/* Image Upload */}
                    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                                {previewImage ? (
                                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                        <User className="w-10 h-10 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 rounded-full text-white cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg">
                                <Camera className="w-4 h-4" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100">Profile Photo</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Upload a new avatar. Larger images will be resized automatically.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="pl-10 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        {/* Email (Read Only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
                            <div className="relative opacity-75 cursor-not-allowed">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={currentUser?.email || ''}
                                    readOnly
                                    className="pl-10 block w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 p-2.5 border font-medium"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Old Password (Required if changing password)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="pl-10 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                                        placeholder="Enter current password"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">New Password (Optional)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                                        placeholder="Leave blank to keep current password"
                                        minLength={8}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className={`flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </section>

            {/* Appearance Section */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                    <span className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        {theme === 'dark' ? <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" /> : <Sun className="w-5 h-5 text-purple-600" />}
                    </span>
                    Appearance
                </h2>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200'
                            }`}
                    >
                        <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            </section>
        </div>
    );
};

export default SettingsPage;
