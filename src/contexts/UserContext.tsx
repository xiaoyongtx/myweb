'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
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
  const supabase = createSupabaseClient();

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
        // 如果是因为表不存在或记录不存在，不要自动创建
        // 让用户手动创建个人资料
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    // 获取当前会话
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
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
      async (_, session) => {
        setUser(session?.user || null);
        
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
  }, [fetchProfile, supabase.auth]);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    try {
      // 1. 调用Supabase API退出
      await supabase.auth.signOut();
      
      // 2. 清除状态
      setUser(null);
      setProfile(null);
      
      // 3. 清除本地存储
      if (typeof window !== 'undefined') {
        // 清除localStorage中的Supabase相关项
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key);
          }
        });
        
        // 清除sessionStorage中的Supabase相关项
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            sessionStorage.removeItem(key);
          }
        });
      }
      
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