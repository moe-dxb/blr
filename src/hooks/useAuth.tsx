
"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { getAuth, onIdTokenChanged, User } from 'firebase/auth';
import { app, functions } from '@/lib/firebase/firebase';
import { httpsCallable } from 'firebase/functions';
import { Loader2 } from 'lucide-react';

const auth = getAuth(app);
const getUserProfile = httpsCallable(functions, 'getUserProfile');

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
  profile: any;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  profile: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        try {
            const result = await getUserProfile();
            const userProfile = result.data as any;
            setProfile(userProfile);
            setRole(userProfile.role || null);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setRole(null);
            setProfile(null);
        }
      } else {
        setUser(null);
        setRole(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }


  return (
    <AuthContext.Provider value={{ user, loading, role, profile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
