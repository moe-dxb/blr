import { useState, useEffect, createContext, useContext } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase/firebase';

interface UserProfile { role?: string }

type Ctx = { user: (User & UserProfile) | null; role: string | null; loading: boolean };
const AuthContext = createContext<Ctx>({ user: null, role: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<(User & UserProfile) | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!app) {
      // In build/SSR or missing env, avoid initializing Firebase on server
      setLoading(false);
      return;
    }

    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        try {
          const fn = httpsCallable<unknown, UserProfile>(getFunctions(app), 'getUserProfile');
          const profile = await fn();
          const userWithProfile = { ...(u as any), ...(profile.data as any) } as User & UserProfile;
          setUser(userWithProfile);
          setRole((profile.data as any)?.role || null);
        } catch {
          setUser(u as any);
          setRole(null);
        }
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