import { createSupabaseClient } from './supabase';

// 直接创建用户个人资料
export async function createUserProfile(userId: string) {
  const supabase = createSupabaseClient();
  console.log('Creating user profile for:', userId);
  
  try {
    // 尝试直接插入个人资料
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
      return null;
    }
    
    console.log('Profile created or updated:', data);
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