import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../types';
import { formatTime, getTimeRemaining } from '../utils/helpers';
import { Trash2, Edit2, Clock, Check, X } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  currentUser: string;
  onDeleteMessage: (messageId: string) => void;
  onEditMessage: (messageId: string, newText: string) => void;
}

export default function MessageList({
  messages,
  currentUser,
  onDeleteMessage,
  onEditMessage,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStartEdit = (message: Message) => {
    setEditingId(message.id);
    setEditText(message.text);
  };

  const handleSaveEdit = () => {
    if (editingId && editText.trim()) {
      onEditMessage(editingId, editText.trim());
      setEditingId(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  // Filter out expired messages
  const validMessages = messages.filter((msg) => {
    const now = Date.now();
    return msg.expiresAt > now;
  });

  if (validMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <span className="text-3xl">💬</span>
          </div>
          <p className="text-slate-500 text-lg">No messages yet</p>
          <p className="text-slate-600 text-sm mt-1">Be the first to say something!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
      {validMessages.map((message) => {
        const isOwn = message.sender === currentUser;
        const timeRemaining = getTimeRemaining(message.expiresAt);
        const isExpired = message.expiresAt <= Date.now();
        const isEditing = editingId === message.id;

        return (
          <div
            key={message.id}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            <div
              className={`max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-3 ${
                isOwn
                  ? 'bg-gradient-to-br from-red-600 to-red-700 text-white rounded-br-md'
                  : 'bg-slate-800 text-slate-100 rounded-bl-md'
              }`}
            >
              {!isOwn && (
                <p className="text-xs font-semibold text-red-400 mb-1">{message.sender}</p>
              )}

              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-slate-700/50 text-white rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={handleCancelEdit}
                      className="p-1.5 rounded-lg bg-slate-600 hover:bg-slate-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="p-1.5 rounded-lg bg-green-600 hover:bg-green-500 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm leading-relaxed break-words">{message.text}</p>
                  <div className={`flex items-center gap-2 mt-1.5 ${isOwn ? 'justify-end' : ''}`}>
                    <span className={`text-xs ${isOwn ? 'text-red-200' : 'text-slate-400'}`}>
                      {formatTime(message.timestamp)}
                    </span>
                    {message.isEdited && (
                      <span className={`text-xs ${isOwn ? 'text-red-200' : 'text-slate-500'}`}>
                        (edited)
                      </span>
                    )}
                    {!isExpired && (
                      <span className={`text-xs flex items-center gap-1 ${isOwn ? 'text-red-200' : 'text-slate-500'}`}>
                        <Clock className="w-3 h-3" />
                        {timeRemaining}
                      </span>
                    )}
                  </div>
                </>
              )}

              {isOwn && !isEditing && (
                <div className={`flex gap-1 mt-2 ${isOwn ? 'justify-end' : ''}`}>
                  <button
                    onClick={() => handleStartEdit(message)}
                    className="p-1.5 rounded-lg bg-red-700/50 hover:bg-red-600/50 transition-colors"
                    title="Edit message"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteMessage(message.id)}
                    className="p-1.5 rounded-lg bg-red-700/50 hover:bg-red-600/50 transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}