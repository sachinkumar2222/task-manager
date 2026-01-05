import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProjectMessages, createMessage, deleteMessage } from '../../api/taskService';
import { Send, MessageSquare, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { getWorkspaceMembers } from '../../api/authService';
import toast from 'react-hot-toast';

const ProjectChat = ({ projectId }) => {
    const { socket, currentUser, activeWorkspace } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [members, setMembers] = useState([]); // To map senderId to Name

    // Auto-scroll ref
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Load initial history and members
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Parallel fetch
                const [msgs, team] = await Promise.all([
                    getProjectMessages(projectId),
                    getWorkspaceMembers(activeWorkspace.id)
                ]);

                // Sort messages: API sends Newest first (desc), we want Oldest first for chat (asc)
                setMessages(msgs.reverse());
                setMembers(team);

            } catch (error) {
                console.error("Failed to load chat:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (projectId && activeWorkspace) {
            loadData();
        }
    }, [projectId, activeWorkspace]);

    // Socket Connection
    useEffect(() => {
        if (!socket) return;

        // Wait for connection to be open before joining?
        // Socket.io queues packets, but let's be explicit.
        if (socket.connected) {
            console.log("Socket already connected, joining room:", projectId);
            socket.emit('join_project', projectId);
        } else {
            socket.on('connect', () => {
                console.log("Socket connected, joining room:", projectId);
                socket.emit('join_project', projectId);
            });
        }

        // Handle explicit re-join on reconnection
        socket.on('reconnect', () => {
            console.log("Socket reconnected, re-joining room:", projectId);
            socket.emit('join_project', projectId);
        });

        // Listen for new messages
        const handleEvent = (event) => {
            console.log("Socket Event Received in Chat:", event);
            // toast(`Received Event: ${event.type}`, { icon: '📩' });

            if (event.type === 'CHAT_MESSAGE') {
                const incomingMsg = event.payload;

                setMessages(prev => {
                    // Check if message with this ID already exists
                    if (prev.some(m => m.id === incomingMsg.id)) {
                        return prev;
                    }
                    return [...prev, incomingMsg];
                });

                setTimeout(scrollToBottom, 50);
            } else if (event.type === 'MESSAGE_DELETED') {
                const deletedId = event.messageId;
                console.log("Processing Delete for ID:", deletedId);
                setMessages(prev => {
                    console.log("Previous Messages IDs:", prev.map(m => m.id));
                    return prev.filter(m => m.id !== deletedId);
                });
            }
        };

        socket.on('project_event', handleEvent);

        return () => {
            socket.off('project_event', handleEvent);
        };
    }, [socket, projectId]);

    // Scroll on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const tempContent = newMessage;
        setNewMessage(''); // Clear input immediately

        // Optimistic Update
        const tempMsg = {
            id: 'temp-' + Date.now(),
            content: tempContent,
            senderId: currentUser.id,
            projectId: projectId,
            createdAt: new Date().toISOString(),
            isTemp: true // Flag to indicate it's not confirmed
        };

        setMessages(prev => [...prev, tempMsg]);
        setTimeout(scrollToBottom, 50);

        try {
            const savedMsg = await createMessage(projectId, tempContent);

            // Replace temp message with real one
            setMessages(prev => prev.map(m =>
                m.id === tempMsg.id ? savedMsg : m
            ));

        } catch (error) {
            console.error("Send failed:", error);
            toast.error("Failed to send message");
            setNewMessage(tempContent);
            // Remove temp message
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
        }
    };

    const handleDelete = async (msgId) => {
        // Optimistic delete
        const prevMessages = [...messages];
        setMessages(prev => prev.filter(m => m.id !== msgId));

        try {
            await deleteMessage(projectId, msgId);
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Failed to delete message");
            // Revert
            setMessages(prevMessages);
        }
    };

    // Helper to get User Name
    const getUserName = (id) => {
        if (id === currentUser.id) return 'You';
        const m = members.find(m => m.userId === id);
        return m ? m.fullName : 'Unknown User';
    };

    // Helper for Avatar Color
    const getAvatarColor = (name) => {
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    if (isLoading) {
        return <div className="h-full flex items-center justify-center text-gray-400">Loading chat...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        <MessageSquare className="mx-auto h-10 w-10 mb-2 opacity-50" />
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const isMe = msg.senderId === currentUser.id;
                    const showHeader = idx === 0 || messages[idx - 1].senderId !== msg.senderId;

                    return (
                        <div key={msg.id || idx} className={`group flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            {showHeader && !isMe && (
                                <span className="text-xs text-gray-500 ml-1 mb-1">{getUserName(msg.senderId)}</span>
                            )}

                            <div className={`flex gap-2 max-w-[80%] items-end ${isMe ? 'flex-row-reverse' : ''}`}>
                                {/* Avatar (only if not me) */}
                                {!isMe && showHeader ? (
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold flex-shrink-0 ${getAvatarColor(getUserName(msg.senderId))}`}>
                                        {getUserName(msg.senderId).charAt(0)}
                                    </div>
                                ) : !isMe ? <div className="w-8 ml-0" /> : null}

                                <div className="relative group">
                                    <div
                                        className={`px-4 py-2 rounded-2xl text-sm break-words relative z-10 ${isMe
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-tl-none shadow-sm'
                                            } ${msg.isTemp ? 'opacity-70' : ''}`}
                                    >
                                        {msg.content}
                                    </div>

                                    {/* Delete Button - Visible on Hover */}
                                    {isMe && !msg.isTemp && (
                                        <button
                                            onClick={() => handleDelete(msg.id)}
                                            className={`absolute top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? '-left-8' : '-right-8'
                                                }`}
                                            title="Delete message"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Time */}
                            <span className="text-[10px] text-gray-400 mt-1 mx-1">
                                {msg.isTemp ? 'Sending...' : format(new Date(msg.createdAt), 'h:mm a')}
                            </span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSend} className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-100 dark:bg-gray-700 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-600 dark:text-gray-100 rounded-full py-2.5 px-4 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProjectChat;
