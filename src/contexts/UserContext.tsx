'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

type UserContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<boolean>;
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
  signOut: async () => false,
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      // 尝试获取个人资料
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
        // 如果是因为表不存在或记录不存在，不要自动创建
        // 让用户手动创建个人资料
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 监听认证状态变化
    // Supabase 会在监听器注册时立即触发一次，包含当前会话状态
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  };

  return (
    <UserContext.Provider value={{ user, profile, loading, refreshProfile, signOut }}>
      {children}
    </UserContext.Provider>
  );
};