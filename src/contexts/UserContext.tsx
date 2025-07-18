'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { initializeSupabaseSchema, createUserProfile } from '@/lib/initSupabase';

type UserContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

type UserProfile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  updated_at: string;
};

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    // 获取当前会话
    const getSession = async () => {
      try {
        console.log('Fetching session...');
        
        // 初始化Supabase架构
        const initialized = await initializeSupabaseSchema();
        console.log('Supabase schema initialized:', initialized);
        
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session fetched:', session ? 'Found' : 'Not found');
        
        setUser(session?.user || null);
        
        if (session?.user) {
          console.log('User found, fetching profile...');
          await fetchProfile(session.user.id);
        } else {
          console.log('No user found in session');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setLoading(false);
      }
    };

    getSession();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setUser(session?.user || null);
        
        if (session?.user) {
          console.log('User found in auth change, fetching profile...');
          await fetchProfile(session.user.id);
        } else {
          console.log('No user found in auth change');
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // 如果找不到profile，创建一个
        if (error.code === 'PGRST116') {
          const newProfile = await createUserProfile(userId);
          if (newProfile) {
            setProfile(newProfile);
          }
        }
      } else {
        console.log('Profile fetched successfully:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <UserContext.Provider value={{ user, profile, loading, refreshProfile, signOut }}>
      {children}
    </UserContext.Provider>
  );
};