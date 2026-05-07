import React, { useState, useEffect, useCallback, useRef } from 'react';
import MessageList, { Message } from './MessageList';
import MessageInput from './MessageInput';
import { useAuth } from '../contexts/AuthContext';
import { getSocket } from '../lib/socket';
import { Users, LogOut, Wifi, WifiOff, MessageCircle } from 'lucide-react';

interface ChatRoomProps {
  onLogout: () => void;
}

interface TypingUser {
  username: string;
  timestamp: number;
}

export default function ChatRoom({ onLogout }: ChatRoomProps) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const socketRef = useRef(getSocket());

  useEffect(() => {
    const socket = socketRef.current;

    const handleConnect = () => {
      setIsConnected(true);
      socket.emit('join', currentUser);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleMessage = (message: Message) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === message.id);
        if (exists) return prev;
        return [...prev, { ...message, isOwn: message.sender === currentUser }];
      });
    };

    const handleMessagesHistory = (history: Message[]) => {
      setMessages(
        history.map((m) => ({ ...m, isOwn: m.sender === currentUser }))
      );
    };

    const handleOnlineUsers = (count: number) => {
      setOnlineUsers(count);
    };

    const handleTyping = (username: string) => {
      if (username !== currentUser) {
        setTypingUsers((prev) => {
          const filtered = prev.filter((u) => u.username !== username);
          return [...filtered, { username, timestamp: Date.now() }];
        });
      }
    };

    const handleStoppedTyping = (username: string) => {
      setTypingUsers((prev) => prev.filter((u) => u.username !== username));
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('message', handleMessage);
    socket.on('messagesHistory', handleMessagesHistory);
    socket.on('onlineUsers', handleOnlineUsers);
    socket.on('typing', handleTyping);
    socket.on('stoppedTyping', handleStoppedTyping);

    // Auto-connect
    setTimeout(() => {
      socket.connect();
    }, 300);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('message', handleMessage);
      socket.off('messagesHistory', handleMessagesHistory);
      socket.off('onlineUsers', handleOnlineUsers);
      socket.off('typing', handleTyping);
      socket.off('stoppedTyping', handleStoppedTyping);
    };
  }, [currentUser]);

  // Clean up stale typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) =>
        prev.filter((u) => now - u.timestamp < 3000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = useCallback((text: string) => {
    const socket = socketRef.current;
    
    const message: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      sender: currentUser || 'Anonymous',
      timestamp: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    // Add message locally immediately
    setMessages((prev) => [...prev, { ...message, isOwn: true }]);
    
    // Emit to server (or broadcast to other clients in real app)
    socket.emit('sendMessage', message);
  }, [currentUser]);

  const handleTyping = useCallback(() => {
    const socket = socketRef.current;
    socket.emitTyping(currentUser || 'Anonymous');
  }, [currentUser]);

  const handleDeleteMessage = useCallback((messageId: string) => {
    const socket = socketRef.current;
    socket.emit('deleteMessage', messageId);
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  const handleEditMessage = useCallback((messageId: string, newText: string) => {
    const socket = socketRef.current;
    socket.emit('editMessage', { messageId, newText });
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, text: newText, isEdited: true } : m
      )
    );
  }, []);

  const typingText = typingUsers.length > 0
    ? typingUsers.length === 1
      ? `${typingUsers[0].username} is typing...`
      : typingUsers.length === 2
        ? `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`
        : `${typingUsers.length} people are typing...`
    : '';

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">AmongusChat</h1>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3 text-green-500" />
                    <span>Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-red-500" />
                    <span>Connecting...</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Users className="w-4 h-4" />
              <span className="text-sm">{onlineUsers || 1} online</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {currentUser?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-white text-sm font-medium hidden sm:block">
                {currentUser}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              title="Leave chat"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto">
        <MessageList
          messages={messages}
          currentUser={currentUser || ''}
          onDeleteMessage={handleDeleteMessage}
          onEditMessage={handleEditMessage}
        />

        {/* Typing Indicator */}
        {typingText && (
          <div className="px-4 py-2">
            <div className="max-w-6xl mx-auto">
              <p className="text-xs text-slate-500 italic animate-pulse">
                {typingText}
              </p>
            </div>
          </div>
        )}

        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          disabled={!isConnected}
        />
      </div>
    </div>
  );
}