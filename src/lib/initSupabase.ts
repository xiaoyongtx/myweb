import { createSupabaseClient } from './supabase';

// 直接创建用户个人资料
export async function createUserProfile(userId: string) {
  const supabase = createSupabaseClient();
  console.log('Creating user profile for:', userId);
  
  try {
    // 首先检查profiles表是否存在
    const { error: checkError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    // 如果表不存在，尝试创建表
    if (checkError && checkError.code === '42P01') {
      console.log('Profiles table does not exist, attempting to create it...');
      const tableCreated = await createProfilesTable();
      if (!tableCreated) {
        console.error('Failed to create profiles table');
        return null;
      }
    }
    
    // 尝试直接插入个人资料
    console.log('Inserting profile for user:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: null,
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error('Error creating profile:', error);
      
      // 如果是外键约束错误，可能是用户ID不存在
      if (error.code === '23503') {
        console.error('Foreign key constraint failed - user ID may not exist in auth.users');
      }
      
      return null;
    }
    
    if (!data || data.length === 0) {
      console.error('No data returned after profile creation');
      return null;
    }
    
    console.log('Profile created or updated successfully:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return null;
  }
}

// 检查用户是否有个人资料
export async function checkUserProfile(userId: string) {
  const supabase = createSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // 没有找到记录
        return null;
      }
      console.error('Error checking profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in checkUserProfile:', error);
    return null;
  }
}

// 创建profiles表
async function createProfilesTable() {
  const supabase = createSupabaseClient();
  console.log('Creating profiles table...');
  
  try {
    // 注意：普通用户可能没有权限创建表，这需要管理员权限
    // 这里我们尝试直接执行SQL，但这可能会失败
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          username TEXT,
          avatar_url TEXT,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- 启用行级安全策略
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        -- 创建策略
        CREATE POLICY "Users can view own profile" 
          ON profiles 
          FOR SELECT 
          USING (auth.uid() = id);
        
        CREATE POLICY "Users can update own profile" 
          ON profiles 
          FOR UPDATE 
          USING (auth.uid() = id);
        
        CREATE POLICY "Users can insert own profile" 
          ON profiles 
          FOR INSERT 
          WITH CHECK (auth.uid() = id);
      `
    });
    
    if (error) {
      console.error('Error creating profiles table:', error);
      return false;
    }
    
    console.log('Profiles table created successfully');
    return true;
  } catch (error) {
    console.error('Error in createProfilesTable:', error);
    return false;
  }
}