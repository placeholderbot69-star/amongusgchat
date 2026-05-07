import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface StoredUser {
  username: string;
  password: string;
  isAnonymous: boolean;
}

interface AuthContextType {
  currentUser: string | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  joinAsAnonymous: (username: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'chatUsers';

function getStoredUsers(): Record<string, StoredUser> {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveStoredUsers(users: Record<string, StoredUser>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('chatUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user.username);
      setIsLoggedIn(true);
    }
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getStoredUsers();
        const user = users[username.toLowerCase()];

        if (!user) {
          resolve({ success: false, error: 'Account not found. Please sign up first.' });
          return;
        }

        if (user.isAnonymous) {
          resolve({ success: false, error: 'This account was created as a quick join. Please sign up with a password.' });
          return;
        }

        if (user.password !== password) {
          resolve({ success: false, error: 'Incorrect password. Please try again.' });
          return;
        }

        const userSession = { username: user.username, isAnonymous: false };
        localStorage.setItem('chatUser', JSON.stringify(userSession));
        setCurrentUser(user.username);
        setIsLoggedIn(true);
        resolve({ success: true });
      }, 500);
    });
  };

  const signup = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (password.length < 4) {
          resolve({ success: false, error: 'Password must be at least 4 characters.' });
          return;
        }

        const users = getStoredUsers();
        const normalizedUsername = username.toLowerCase();

        if (users[normalizedUsername]) {
          resolve({ success: false, error: 'Username already taken. Please choose another.' });
          return;
        }

        users[normalizedUsername] = {
          username,
          password,
          isAnonymous: false,
        };
        saveStoredUsers(users);

        const userSession = { username, isAnonymous: false };
        localStorage.setItem('chatUser', JSON.stringify(userSession));
        setCurrentUser(username);
        setIsLoggedIn(true);
        resolve({ success: true });
      }, 500);
    });
  };

  const logout = () => {
    localStorage.removeItem('chatUser');
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  const joinAsAnonymous = (username: string) => {
    const userSession = { username, isAnonymous: true };
    localStorage.setItem('chatUser', JSON.stringify(userSession));
    setCurrentUser(username);
    setIsLoggedIn(true);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        login,
        signup,
        logout,
        joinAsAnonymous,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}