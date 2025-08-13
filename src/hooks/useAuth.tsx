import { useState, useEffect, createContext, useContext } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase/firebase';

interface UserProfile {
    role?: string;
}

const auth = getAuth(app ?? undefined);
const getUserProfile = httpsCallable<unknown, UserProfile>(getFunctions(app ?? undefined), 'getUserProfile');

const AuthContext = createContext<{ user: (User & UserProfile) | null, role: string | null, loading: boolean }>({
  user: null,
  role: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<(User & UserProfile) | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile();
        const userWithProfile = { ...user, ...profile.data } as User & UserProfile;
        setUser(userWithProfile);
        setRole((profile.data as any)?.role || null);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);