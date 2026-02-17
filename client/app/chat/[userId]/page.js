"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Phone, Video, MoreHorizontal, Shield, Info, ImageIcon, Film, X, Camera, Paperclip, Play, Download, FileIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatRoom() {
    const { userId } = useParams();
    const { user } = useAuth();
    const socket = useSocket(user?._id);
    const router = useRouter();
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [mediaPreview, setMediaPreview] = useState(null); // { file, url, type }
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [lightboxMedia, setLightboxMedia] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const scrollRef = useRef();
    const fileInputRef = useRef();
    const videoInputRef = useRef();
    const cameraInputRef = useRef();
    const videoRef = useRef();
    const canvasRef = useRef();

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await api.get(`/chat/${userId}`);
                setChat(data);
                setMessages(data.messages);
            } catch (err) {
                console.error(err);
            }
        };
        if (user) fetchMessages();
    }, [userId, user]);

    useEffect(() => {
        if (socket) {
            socket.on('message received', (newMessage) => {
                if (newMessage.senderId === userId) {
                    setMessages(prev => [...prev, newMessage]);
                }
            });

            socket.on('typing', () => setIsTyping(true));
            socket.on('stop typing', () => setIsTyping(false));

            socket.on('message deleted', ({ messageId }) => {
                setMessages(prev => prev.filter(m => m._id !== messageId));
            });
        }
    }, [socket, userId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraStream]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        socket.emit('stop typing', userId);
        setTyping(false);

        try {
            const { data } = await api.post('/chat/send', { text, receiverId: userId });
            const newMessage = data.messages[data.messages.length - 1];
            setMessages(prev => [...prev, newMessage]);
            socket.emit('new message', { ...newMessage, chat: data });
            setText('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileSelect = (e, mediaType) => {
        const file = e.target.files?.[0];

        // Reset the input value to allow selecting the same file again
        if (e.target) {
            e.target.value = '';
        }

        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
            alert('Please select an image or video file.');
            return;
        }

        // File size check (50MB)
        if (file.size > 50 * 1024 * 1024) {
            alert('File too large. Maximum size is 50MB.');
            return;
        }

        try {
            const url = URL.createObjectURL(file);
            setMediaPreview({
                file,
                url,
                type: isImage ? 'image' : 'video',
                name: file.name,
                size: file.size
            });
            setShowAttachMenu(false);
        } catch (error) {
            console.error('Error creating preview:', error);
            alert('Failed to preview file. Please try again.');
        }
    };

    const cancelMediaPreview = () => {
        if (mediaPreview?.url) {
            URL.revokeObjectURL(mediaPreview.url);
        }
        setMediaPreview(null);
        setUploadProgress(0);
    };

    const handleSendMedia = async () => {
        if (!mediaPreview?.file) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            console.log('Uploading media:', {
                fileName: mediaPreview.file.name,
                fileSize: mediaPreview.file.size,
                fileType: mediaPreview.file.type
            });

            const formData = new FormData();
            formData.append('media', mediaPreview.file);
            formData.append('receiverId', userId);

            const { data } = await api.post('/chat/send-media', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(pct);
                    console.log(`Upload progress: ${pct}%`);
                }
            });

            console.log('Media uploaded successfully:', data);
            const newMessage = data.messages[data.messages.length - 1];
            console.log('New message with media:', newMessage);

            setMessages(prev => [...prev, newMessage]);
            socket.emit('new message', { ...newMessage, chat: data });
            cancelMediaPreview();
        } catch (err) {
            console.error('Upload failed:', err);
            console.error('Error details:', err.response?.data);
            alert(`Failed to send media: ${err.response?.data?.message || err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;

        try {
            await api.delete(`/chat/${chat._id}/message/${messageId}`);

            // Update local state
            setMessages(prev => prev.filter(m => m._id !== messageId));

            // Emit socket event
            socket.emit('delete message', {
                chatId: chat._id,
                messageId: messageId,
                receiverId: userId
            });
        } catch (err) {
            console.error('Delete message failed:', err);
            alert('Failed to delete message');
        }
    };

    const openCamera = async () => {
        try {
            console.log('Opening camera...');
            setShowAttachMenu(false);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }, // Front camera
                audio: false
            });

            console.log('Camera stream obtained');
            setCameraStream(stream);
            setShowCamera(true);

            // Wait for video element to be ready
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (error) {
            console.error('Camera access error:', error);
            if (error.name === 'NotAllowedError') {
                alert('Camera access denied. Please allow camera access in your browser settings.');
            } else if (error.name === 'NotFoundError') {
                alert('No camera found on this device.');
            } else {
                alert(`Failed to access camera: ${error.message}`);
            }
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) {
            console.error('Video or canvas ref not available');
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current video frame to canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob
        canvas.toBlob((blob) => {
            if (!blob) {
                alert('Failed to capture photo');
                return;
            }

            // Create file from blob
            const timestamp = Date.now();
            const file = new File([blob], `camera-${timestamp}.jpg`, { type: 'image/jpeg' });

            console.log('Photo captured:', {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type
            });

            // Create preview URL
            const url = URL.createObjectURL(blob);

            setMediaPreview({
                file,
                url,
                type: 'image',
                name: file.name,
                size: file.size
            });

            // Close camera
            closeCamera();
        }, 'image/jpeg', 0.95);
    };

    const closeCamera = () => {
        console.log('Closing camera...');

        // Stop all video tracks
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => {
                track.stop();
                console.log('Stopped track:', track.kind);
            });
            setCameraStream(null);
        }

        // Clear video element
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setShowCamera(false);
    };

    const typingHandler = (e) => {
        setText(e.target.value);
        if (!socket) return;

        if (!typing) {
            setTyping(true);
            socket.emit('typing', userId);
        }

        let lastTypingTime = new Date().getTime();
        setTimeout(() => {
            let timeNow = new Date().getTime();
            if (timeNow - lastTypingTime >= 3000 && typing) {
                socket.emit('stop typing', userId);
                setTyping(false);
            }
        }, 3000);
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const renderMessageContent = (msg, isOwn) => {
        const msgType = msg.type || 'text';

        if (msgType === 'image') {
            return (
                <div className="relative group/media">
                    <img
                        src={msg.mediaUrl}
                        alt="Shared photo"
                        className="max-w-[280px] max-h-[320px] rounded-2xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setLightboxMedia({ url: msg.mediaUrl, type: 'image' })}
                        loading="lazy"
                        onError={(e) => {
                            console.error('Failed to load image:', msg.mediaUrl);
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-[280px] h-[200px] bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400 text-xs">Failed to load image</div>';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl opacity-0 group-hover/media:opacity-100 transition-opacity pointer-events-none" />
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const a = document.createElement('a');
                            a.href = msg.mediaUrl;
                            a.download = msg.fileName || 'photo';
                            a.click();
                        }}
                        className="absolute bottom-2 right-2 p-1.5 bg-black/50 rounded-full opacity-0 group-hover/media:opacity-100 transition-opacity backdrop-blur-sm"
                    >
                        <Download size={14} className="text-white" />
                    </button>
                </div>
            );
        }

        if (msgType === 'video') {
            return (
                <div className="relative group/media max-w-[280px]">
                    <video
                        src={msg.mediaUrl}
                        className="max-w-[280px] max-h-[320px] rounded-2xl object-cover cursor-pointer"
                        onClick={() => setLightboxMedia({ url: msg.mediaUrl, type: 'video' })}
                        preload="metadata"
                        onError={(e) => {
                            console.error('Failed to load video:', msg.mediaUrl);
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-[280px] h-[200px] bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400 text-xs">Failed to load video</div>';
                        }}
                    />
                    <div
                        className="absolute inset-0 flex items-center justify-center cursor-pointer rounded-2xl bg-black/20 hover:bg-black/30 transition-colors"
                        onClick={() => setLightboxMedia({ url: msg.mediaUrl, type: 'video' })}
                    >
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl">
                            <Play size={24} className="text-white ml-1" fill="white" />
                        </div>
                    </div>
                    {msg.fileName && (
                        <div className="mt-1.5 px-1">
                            <p className="text-[11px] opacity-60 truncate">{msg.fileName}</p>
                        </div>
                    )}
                </div>
            );
        }

        // Text message
        return <p className="text-sm font-medium leading-relaxed">{msg.text}</p>;
    };

    if (!chat) return (
        <div className="h-screen bg-black flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const recipient = chat.members.find(m => m._id === userId);

    return (
        <div className="flex flex-col h-screen bg-[#0A0A0A] text-white">
            {/* Header */}
            <header className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/chat')}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>

                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/profile/${userId}`)}>
                        <div className="relative">
                            <img
                                src={recipient.images?.[0]}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-500/20"
                                alt=""
                            />
                            {recipient.onlineStatus && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
                            )}
                        </div>
                        <div>
                            <h4 className="font-black text-sm tracking-tight">{recipient.name}</h4>
                            <p className={`text-[10px] font-bold uppercase tracking-widest ${isTyping ? 'text-pink-500 animate-pulse' : 'text-gray-500'}`}>
                                {isTyping ? 'Typing...' : (recipient.onlineStatus ? 'Online' : 'Recently Active')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => router.push(`/call/${userId}?type=audio`)}
                        className="p-2.5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
                    >
                        <Phone size={20} />
                    </button>
                    <button
                        onClick={() => router.push(`/call/${userId}?type=video`)}
                        className="p-2.5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
                    >
                        <Video size={20} />
                    </button>
                    <button
                        onClick={() => setShowOptions(!showOptions)}
                        className="p-2.5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
                    >
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </header>

            {/* Options Menu Popover */}
            <AnimatePresence>
                {showOptions && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute top-16 right-4 w-48 bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl z-[60] overflow-hidden"
                    >
                        <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors text-sm font-bold">
                            <Info size={18} className="text-blue-400" />
                            View Profile
                        </button>
                        <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors text-sm font-bold">
                            <Shield size={18} className="text-yellow-400" />
                            Report User
                        </button>
                        <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors text-sm font-bold border-t border-white/5 text-red-500">
                            Unmatch
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col custom-scrollbar">
                <div className="flex-1" /> {/* Spacer to push messages to bottom */}

                {/* Match Indicator */}
                <div className="flex flex-col items-center py-10 opacity-50">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center mb-4">
                        <Shield size={32} className="text-gray-700" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-600">You matched with {recipient.name}</p>
                    <p className="text-[10px] text-gray-700 mt-1">Feb 2026</p>
                </div>

                <AnimatePresence mode="popLayout">
                    {messages.map((msg, idx) => {
                        const isOwn = msg.senderId === user._id;
                        const showTime = idx === 0 || new Date(msg.createdAt) - new Date(messages[idx - 1].createdAt) > 300000;
                        const msgType = msg.type || 'text';
                        const isMedia = msgType === 'image' || msgType === 'video';

                        return (
                            <motion.div
                                key={msg._id || idx}
                                className="space-y-2 origin-center"
                                layout
                                initial={{ opacity: 0, scale: 0.8, y: 20, filter: 'blur(5px)' }}
                                animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.5,
                                    rotate: isOwn ? 15 : -15,
                                    x: isOwn ? 100 : -100,
                                    filter: 'blur(15px)',
                                    transition: {
                                        duration: 0.35,
                                        ease: [0.32, 0, 0.67, 0]
                                    }
                                }}
                                transition={{
                                    layout: {
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 40,
                                        mass: 1
                                    },
                                    opacity: { duration: 0.2 },
                                    scale: { type: "spring", stiffness: 300, damping: 25 }
                                }}
                            >
                                {showTime && (
                                    <p className="text-[10px] font-black uppercase tracking-tighter text-gray-700 text-center my-4">
                                        {new Date(msg.createdAt).toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                )}
                                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`group relative max-w-[80%] flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {!isOwn && (
                                            <img src={recipient.images?.[0]} className="w-6 h-6 rounded-full object-cover mb-1 border border-white/10" alt="" />
                                        )}
                                        <div className={`${isMedia ? 'p-1.5' : 'p-4'} rounded-3xl shadow-lg shadow-black/20 ${isOwn
                                            ? 'bg-gradient-to-br from-pink-600 to-purple-700 text-white rounded-tr-none'
                                            : 'bg-[#1A1A1A] border border-white/5 text-white rounded-tl-none'
                                            }`}>
                                            {renderMessageContent(msg, isOwn)}
                                            <div className={`flex items-center justify-between ${isMedia ? 'mt-0.5 px-2 pb-1' : 'mt-1'}`}>
                                                {isOwn && (
                                                    <button
                                                        onClick={() => handleDeleteMessage(msg._id)}
                                                        className="p-1 opacity-0 group-hover:opacity-40 hover:!opacity-100 hover:text-red-300 transition-all"
                                                        title="Delete message"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                                <div className="flex-1" />
                                                {isOwn && (
                                                    <span className="text-[9px] opacity-40 font-bold uppercase tracking-tighter">
                                                        {msg.seen ? 'Read' : 'Sent'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={scrollRef} className="h-4" />
            </div>

            {/* Media Preview Bar */}
            <AnimatePresence>
                {mediaPreview && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: 20, height: 0 }}
                        className="border-t border-white/5 bg-black/80 backdrop-blur-xl"
                    >
                        <div className="p-4 max-w-4xl mx-auto">
                            <div className="flex items-start gap-4">
                                {/* Preview thumbnail */}
                                <div className="relative flex-shrink-0">
                                    {mediaPreview.type === 'image' ? (
                                        <img
                                            src={mediaPreview.url}
                                            alt="Preview"
                                            className="w-24 h-24 rounded-2xl object-cover border border-white/10"
                                        />
                                    ) : (
                                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10">
                                            <video
                                                src={mediaPreview.url}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                <Play size={20} fill="white" className="text-white" />
                                            </div>
                                        </div>
                                    )}
                                    {/* Cancel button */}
                                    <button
                                        onClick={cancelMediaPreview}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-400 transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>

                                {/* File info */}
                                <div className="flex-1 min-w-0 py-1">
                                    <p className="text-sm font-bold truncate text-white">{mediaPreview.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">{formatFileSize(mediaPreview.size)}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${mediaPreview.type === 'image'
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'bg-purple-500/20 text-purple-400'
                                            }`}>
                                            {mediaPreview.type === 'image' ? '📷 Photo' : '🎥 Video'}
                                        </span>
                                    </div>
                                </div>

                                {/* Send button */}
                                <button
                                    onClick={handleSendMedia}
                                    disabled={uploading}
                                    className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? (
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Send size={20} className="translate-x-0.5 -translate-y-0.5" />
                                    )}
                                </button>
                            </div>

                            {/* Upload Progress Bar */}
                            {uploading && (
                                <div className="mt-3">
                                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${uploadProgress}%` }}
                                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1 text-right font-bold">{uploadProgress}%</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Pad */}
            <div className="p-6 bg-black/50 backdrop-blur-2xl border-t border-white/5">
                <form onSubmit={handleSendMessage} className="relative flex items-end gap-3 max-w-4xl mx-auto">
                    {/* Attach button */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowAttachMenu(!showAttachMenu)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${showAttachMenu
                                ? 'bg-pink-500/20 text-pink-400 rotate-45'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <Paperclip size={20} />
                        </button>

                        {/* Attach Menu */}
                        <AnimatePresence>
                            {showAttachMenu && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                    className="absolute bottom-16 left-0 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 p-3 min-w-[180px] z-50"
                                >
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                                            <ImageIcon size={18} className="text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-white">Photo</p>
                                            <p className="text-[10px] text-gray-500">Send an image</p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => videoInputRef.current?.click()}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
                                            <Film size={18} className="text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-white">Video</p>
                                            <p className="text-[10px] text-gray-500">Send a video</p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={openCamera}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
                                            <Camera size={18} className="text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-white">Camera</p>
                                            <p className="text-[10px] text-gray-500">Take a photo</p>
                                        </div>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Hidden file inputs */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={(e) => handleFileSelect(e, 'image')}
                        className="hidden"
                    />
                    <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={(e) => handleFileSelect(e, 'video')}
                        className="hidden"
                    />
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="user"
                        onChange={(e) => handleFileSelect(e, 'image')}
                        className="hidden"
                    />

                    <div className="flex-1 bg-white/5 border border-white/10 rounded-[2rem] p-4 flex flex-col transition-all focus-within:bg-white/10 focus-within:border-pink-500/50">
                        <textarea
                            rows={1}
                            value={text}
                            onChange={typingHandler}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            placeholder={`Message ${recipient.name}...`}
                            className="bg-transparent text-sm outline-none resize-none max-h-32 font-medium"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!text.trim()}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${text.trim()
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                            : 'bg-white/5 text-gray-600 cursor-not-allowed'
                            }`}
                    >
                        <Send size={24} className={text.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''} />
                    </button>
                </form>
                <p className="text-[10px] text-center text-gray-600 mt-4 font-bold uppercase tracking-widest">
                    Safety Tip: Always meet in a public place
                </p>
            </div>

            {/* Media Lightbox */}
            <AnimatePresence>
                {lightboxMedia && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
                        onClick={() => setLightboxMedia(null)}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setLightboxMedia(null)}
                            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10"
                        >
                            <X size={24} />
                        </button>

                        {/* Download button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const a = document.createElement('a');
                                a.href = lightboxMedia.url;
                                a.download = 'media';
                                a.click();
                            }}
                            className="absolute top-6 left-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10"
                        >
                            <Download size={24} />
                        </button>

                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            className="max-w-[90vw] max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {lightboxMedia.type === 'image' ? (
                                <img
                                    src={lightboxMedia.url}
                                    alt="Full size"
                                    className="max-w-full max-h-[90vh] object-contain rounded-2xl"
                                />
                            ) : (
                                <video
                                    src={lightboxMedia.url}
                                    controls
                                    autoPlay
                                    className="max-w-full max-h-[90vh] rounded-2xl"
                                />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Camera Modal */}
            <AnimatePresence>
                {showCamera && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black z-[100] flex flex-col"
                    >
                        {/* Camera Header */}
                        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
                            <div className="flex items-center justify-between">
                                <h3 className="text-white font-black text-lg">Take a Photo</h3>
                                <button
                                    onClick={closeCamera}
                                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                                >
                                    <X size={24} className="text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Video Preview */}
                        <div className="flex-1 relative overflow-hidden">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="absolute inset-0 w-full h-full object-cover"
                            />

                            {/* Hidden canvas for capturing */}
                            <canvas ref={canvasRef} className="hidden" />
                        </div>

                        {/* Camera Controls */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                            <div className="flex items-center justify-center gap-8">
                                {/* Cancel Button */}
                                <button
                                    onClick={closeCamera}
                                    className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                                >
                                    <X size={24} className="text-white" />
                                </button>

                                {/* Capture Button */}
                                <button
                                    onClick={capturePhoto}
                                    className="w-20 h-20 rounded-full bg-white border-4 border-white/30 hover:scale-110 transition-transform shadow-2xl shadow-white/20"
                                >
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500 to-purple-600" />
                                </button>

                                {/* Placeholder for symmetry */}
                                <div className="w-14 h-14" />
                            </div>

                            <p className="text-center text-white/60 text-xs mt-4 font-bold uppercase tracking-widest">
                                Tap to capture
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Click-away for attach menu */}
            {showAttachMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowAttachMenu(false)}
                />
            )}

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
      `}</style>
        </div>
    );
}
