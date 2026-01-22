import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { getCurrentUser, isAdminUser, onAuthStateChange } from '@/lib/authApi';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check current user on mount
    getCurrentUser().then(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const adminStatus = await isAdminUser(currentUser.email || '');
        setIsAdmin(adminStatus);
      }
      setIsLoading(false);
    });

    // Subscribe to auth state changes
    const subscription = onAuthStateChange(async (newUser) => {
      setUser(newUser);
      if (newUser) {
        const adminStatus = await isAdminUser(newUser.email || '');
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  return { user, isAdmin, isLoading };
}
