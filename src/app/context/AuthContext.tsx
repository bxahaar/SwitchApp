import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  showSplash: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Upsert the user profile into the public.users table.
// Called after SIGNED_IN and on session restore so returning users are updated too.
async function syncUserProfile(user: User): Promise<void> {
  const payload = {
    id: user.id,
    email: user.email ?? null,
    full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
    phone: null, // Google OAuth does not supply a phone number
  };

  console.log('[Auth] syncing user profile:', payload);

  const { error } = await supabase
    .from('users')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.error(
      '[Auth] upsert error:',
      error.message,
      '| code:', error.code,
      '| details:', error.details,
      '| hint:', error.hint,
    );
  } else {
    console.log('[Auth] user profile synced successfully');
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Restore existing session on mount.
    //    After an OAuth redirect the session lives in the URL hash — Supabase
    //    picks it up automatically and getSession() returns it.
    supabase.auth.getSession().then(({ data: { session: s }, error }) => {
      if (error) console.error('[Auth] getSession error:', error.message);
      setSession(s);
      setLoading(false);
      // Sync profile on page-reload if a session is already present.
      // onAuthStateChange fires INITIAL_SESSION (not SIGNED_IN) on reload,
      // so we handle the profile sync here explicitly.
      if (s?.user) {
        syncUserProfile(s.user);
      }
    });

    // 2. Subscribe to real-time auth state changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      console.log('[Auth] event:', event);
      setSession(s);
      // SIGNED_IN fires on the first OAuth callback after the Google redirect.
      if (event === 'SIGNED_IN' && s?.user) {
        syncUserProfile(s.user);
      }
    });

    // 3. Hide splash after 2.5 s.
    const timer = setTimeout(() => setShowSplash(false), 2500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const login = async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) console.error('[Auth] signInWithOAuth error:', error.message);
  };

  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('[Auth] signOut error:', error.message);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!session && !loading,
        user: session?.user ?? null,
        login,
        logout,
        showSplash,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
