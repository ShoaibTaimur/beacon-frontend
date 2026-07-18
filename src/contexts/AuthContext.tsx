import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, UserCredential } from 'firebase/auth';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from '../services/firebase';
import { syncUser, getMe } from '../services/api';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: any | null;
  authError: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  register: (email: string, password: string, displayName?: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        // Sync user to backend and fetch DB profile
        try {
          await syncUser({
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          });

          const profileRes = await getMe();
          setProfile(profileRes.data?.user || null);
          setUser(firebaseUser);
          setAuthError(null);
        } catch (error: any) {
          console.warn('[Auth] Sync/Profile fetch failed:', error.message);
          
          // Handle explicit blocks or bans (403 status code)
          if (error.response?.status === 403) {
            const serverMsg = error.response.data?.error || 'Access denied. Account is blocked.';
            setAuthError(serverMsg);
            setProfile(null);
            setUser(null);
            await signOut(auth);
          } else {
            // Keep Firebase session active for general temporary network glitches
            setUser(firebaseUser);
          }
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearAuthError = () => setAuthError(null);

  const login = async (email: string, password: string) => {
    setAuthError(null);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, displayName?: string) => {
    setAuthError(null);
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    return result;
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    return signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    setAuthError(null);
    setProfile(null);
    setUser(null);
    return signOut(auth);
  };

  const value: AuthContextType = {
    user,
    profile,
    authError,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    clearAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;
