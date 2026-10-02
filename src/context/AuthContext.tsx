import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile;
  role: UserRole;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  setDemoRole: (newRole: UserRole) => void;
  isAdmin: boolean;
  isBendahari: boolean;
  isAJK: boolean;
  canEditFinance: boolean;
  canDeleteFinance: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Default active profile & role (Bendahari/Admin by default for immediate convenience)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('adc_user_role');
    const role: UserRole = (saved as UserRole) || 'BENDAHARI';
    return {
      uid: 'user_bendahari_01',
      email: 'bendahari@adcdarts.club',
      displayName: 'Bendahari Kelab ADC',
      role: role,
      createdAt: new Date().toISOString(),
    };
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const isAdminEmail = user.email === 'fuzz653@gmail.com';
        setUserProfile((prev) => ({
          uid: user.uid,
          email: user.email || 'ahli@adcdarts.club',
          displayName: user.displayName || 'Ahli Kelab ADC',
          role: isAdminEmail ? 'ADMIN' : prev.role || 'BENDAHARI',
          createdAt: prev.createdAt,
        }));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn('Google sign-in popup notice:', err);
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const setDemoRole = (newRole: UserRole) => {
    localStorage.setItem('adc_user_role', newRole);
    setUserProfile((prev) => ({
      ...prev,
      role: newRole,
      displayName:
        newRole === 'ADMIN'
          ? 'Pentadbir Utama ADC'
          : newRole === 'BENDAHARI'
          ? 'Bendahari ADC'
          : 'AJK Tertinggi ADC',
    }));
  };

  const role = userProfile.role;
  const isAdmin = role === 'ADMIN';
  const isBendahari = role === 'BENDAHARI' || isAdmin;
  const isAJK = role === 'AJK';

  // Role permissions
  const canEditFinance = isAdmin || isBendahari;
  const canDeleteFinance = isAdmin; // Only admin can delete transactions/members

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role,
        loading,
        signInWithGoogle,
        logOut,
        setDemoRole,
        isAdmin,
        isBendahari,
        isAJK,
        canEditFinance,
        canDeleteFinance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
