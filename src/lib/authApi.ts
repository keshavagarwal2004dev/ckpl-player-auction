import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthUser extends User {
  isAdmin?: boolean;
}

export async function loginWithEmail(email: string, password: string): Promise<{ user: User; error: any }> {
  console.log('[loginWithEmail] Attempting login for:', email);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[loginWithEmail] Auth error:', error.message);
      throw error;
    }

    console.log('[loginWithEmail] Success, user:', data.user?.email);
    return { user: data.user as User, error: null };
  } catch (err: any) {
    console.error('[loginWithEmail] Exception:', err.message);
    return { user: null as any, error: err };
  }
}

export async function logout(): Promise<{ error: any }> {
  console.log('[logout] Logging out current user');
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log('[logout] Success');
    return { error: null };
  } catch (err: any) {
    console.error('[logout] Error:', err.message);
    return { error: err };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('[getCurrentUser] Current user:', session?.user?.email || 'None');
    return session?.user || null;
  } catch (err: any) {
    console.error('[getCurrentUser] Error:', err.message);
    return null;
  }
}

export async function isAdminUser(email: string): Promise<boolean> {
  // Admin user defined by email
  const ADMIN_EMAIL = 'kes2004ag@gmail.com';
  const isAdmin = email === ADMIN_EMAIL;
  console.log('[isAdminUser] Checking', email, '- isAdmin:', isAdmin);
  return isAdmin;
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    console.log('[onAuthStateChange] Auth state changed, user:', session?.user?.email || 'None');
    callback(session?.user || null);
  });

  return subscription;
}
