import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ChatRoom from './components/ChatRoom';
import LoginModal from './components/LoginModal';
import { Stars, Zap } from 'lucide-react';

function AppContent() {
  const { isLoggedIn, currentUser, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    setShowLogin(true);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse">
          <Zap className="w-12 h-12 text-red-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars" />
        <div className="stars2" />
        <div className="stars3" />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {isLoggedIn ? (
        <ChatRoom onLogout={handleLogout} />
      ) : (
        <>
          {/* Landing Page */}
          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
            <div className="text-center mb-8 animate-fadeIn">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 mb-6 shadow-lg shadow-red-500/25">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                Amongus<span className="text-red-500">Chat</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-md mx-auto">
                Join the global chat. Connect with players worldwide in real-time.
              </p>
            </div>

            <button
              onClick={() => setShowLogin(true)}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-lg rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-red-500/25 animate-fadeIn"
              style={{ animationDelay: '0.2s' }}
            >
              Start Chatting
            </button>

            <div className="mt-8 flex items-center gap-6 text-slate-500 text-sm animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <span className="flex items-center gap-2">
                <Stars className="w-4 h-4" />
                Real-time messaging
              </span>
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                24h message history
              </span>
            </div>
          </div>

          <LoginModal 
            isOpen={showLogin} 
            onClose={() => setShowLogin(false)} 
          />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}