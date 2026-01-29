
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_EMAILS } from '../constants';
import { User } from '../types';
import { fetchUsersFromFirebase, addUserToFirebase } from '../services/firebaseService';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string) => Promise<{success: boolean, message?: string}>; // Update return type
  logout: () => void;
  showAuthModal: boolean;
  authMode: 'login' | 'signup';
  openLogin: () => void;
  openSignup: () => void;
  closeAuthModal: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const login = async (email: string): Promise<{success: boolean, message?: string}> => {
    setIsLoading(true);
    const cleanEmail = email.toLowerCase().trim();
    
    // 1. Cek Super Admin (Hardcoded di constants.ts) - Backdoor
    if (ADMIN_EMAILS.includes(cleanEmail)) {
        const adminUser: User = {
            name: cleanEmail.split('@')[0],
            email: cleanEmail,
            avatar: `https://i.pravatar.cc/150?u=${cleanEmail}`,
            role: 'instructor',
            accessList: ['*'] // Admin akses semua
        };
        
        setUser(adminUser);
        
        // Auto-add admin to firebase if not exists (Lazy registration)
        addUserToFirebase(adminUser);

        setIsLoading(false);
        setShowAuthModal(false);
        navigate('/admin');
        return { success: true };
    }

    // 2. Cek Database Firebase
    try {
        const dbUsers = await fetchUsersFromFirebase();
        const foundUser = dbUsers.find(u => u.email === cleanEmail);

        if (foundUser) {
            setUser(foundUser);
            setShowAuthModal(false);
            
            // Redirect Logic
            if (foundUser.role === 'instructor') {
                navigate('/admin');
            } else {
                navigate('/');
            }
            setIsLoading(false);
            return { success: true };
        } else {
            // User tidak ditemukan di db
            // KITA HAPUS ALERT DAN KEMBALIKAN STATUS GAGAL
            setIsLoading(false);
            return { success: false, message: "Email tidak terdaftar di sistem. Silakan checkout produk terlebih dahulu." };
        }
    } catch (error) {
        setIsLoading(false);
        console.error("Login Error:", error);
        return { success: false, message: "Terjadi kesalahan koneksi. Silakan coba lagi." };
    }
  };

  const logout = () => {
    setUser(null);
    navigate('/');
  };

  const openLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const openSignup = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn: !!user, 
      login, 
      logout,
      showAuthModal,
      authMode,
      openLogin,
      openSignup,
      closeAuthModal,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
