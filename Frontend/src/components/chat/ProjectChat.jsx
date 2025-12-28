import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProjectMessages, createMessage } from '../../api/taskService';
import { Send, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { getWorkspaceMembers } from '../../api/authService';

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
                // setMessages(msgs.reverse()); 
                // Wait, if API returns desc, reversing makes it asc (Oldest at top). Correct.
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

        // Join Room
        socket.emit('join_project', projectId);

        // Listen for new messages
        const handleEvent = (event) => {
            // We use a generic 'project_event', check type
            if (event.type === 'CHAT_MESSAGE') {
                // Check if we already have this message (optimistic UI or duplicated)
                // Or just append rely on key?
                // Let's just append.
                setMessages(prev => [...prev, event.payload]); // payload is the full message object
                // Scroll to bottom
                setTimeout(scrollToBottom, 50);
            }
        };

        socket.on('project_event', handleEvent);

        return () => {
            socket.off('project_event', handleEvent);
            // leave room? socket.io handles it on disconnect, explicitly leaving is fine but optional here
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

        try {
            await createMessage(projectId, tempContent);
            // We do NOT manually append here because the Socket event will come back to us?
            // Actually, for "instant" feel, we SHOULD append optimistically (or if socket is fast enough).
            // But if we append AND socket comes, we get duplicate.
            // Best practice: Append specific ID or wait for socket.
            // Since our socket creates message and broadcasts, we will receive it.
            // But we created it, so we are the sender.
            // If the backend BROADCASTS to the room, DOES IT include sender?
            // Usually yes, 'io.to(room).emit' sends to everyone in room INCLUDING sender.
            // Unlike 'socket.to(room).emit' which excludes sender.
            // I used 'ioInstance.to(room)' in socketHandler.js, so it INCLUDES sender.
            // So I don't need to manually append, just wait for socket.
        } catch (error) {
            console.error("Send failed:", error);
            // Restore input?
            setNewMessage(tempContent);
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
            {/* Header / Info? */}
            {/* <div className="p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 font-medium">Project Team Chat</div> */}

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
                        <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            {showHeader && !isMe && (
                                <span className="text-xs text-gray-500 ml-1 mb-1">{getUserName(msg.senderId)}</span>
                            )}

                            <div className={`flex gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : ''}`}>
                                {/* Avatar (only if not me) */}
                                {!isMe && showHeader ? (
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold flex-shrink-0 ${getAvatarColor(getUserName(msg.senderId))}`}>
                                        {getUserName(msg.senderId).charAt(0)}
                                    </div>
                                ) : !isMe ? <div className="w-8 ml-0" /> : null}

                                <div
                                    className={`px-4 py-2 rounded-2xl text-sm break-words ${isMe
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-tl-none shadow-sm'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>

                            {/* Time */}
                            <span className="text-[10px] text-gray-400 mt-1 mx-1">
                                {format(new Date(msg.createdAt), 'h:mm a')}
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
                        className="flex-1 bg-gray-100 dark:bg-gray-700/50 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 rounded-full py-2.5 px-4 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
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
