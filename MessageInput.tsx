import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onTyping: () => void;
  disabled?: boolean;
}

export default function MessageInput({ onSendMessage, onTyping, disabled }: MessageInputProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const trimmedText = text.trim();
    if (!trimmedText || isSending || disabled) return;

    setIsSending(true);
    onSendMessage(trimmedText);
    setText('');
    
    // Reset sending state after a short delay
    setTimeout(() => {
      setIsSending(false);
      inputRef.current?.focus();
    }, 200);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onTyping();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700/50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 bg-slate-800/50 rounded-2xl px-4 py-2 border border-slate-700/50 focus-within:border-red-500/50 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? 'Connecting...' : 'Type a message...'}
            disabled={disabled}
            maxLength={500}
            className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
          />
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              {text.length}/500
            </span>
            
            <button
              type="submit"
              disabled={!text.trim() || isSending || disabled}
              className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 transition-all transform active:scale-95 disabled:transform-none"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}