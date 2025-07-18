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
      
      // 如果是因为表不存在，尝试创建表
      if (error.code === '42P01') { // 表不存在的错误代码
        await createProfilesTable();
        
        // 再次尝试插入
        const retryResult = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            username: null,
            avatar_url: null,
            updated_at: new Date().toISOString()
          })
          .select();
          
        if (retryResult.error) {
          console.error('Error creating profile after table creation:', retryResult.error);
          return null;
        }
        
        return retryResult.data[0];
      }
      
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

// 创建profiles表
async function createProfilesTable() {
  const supabase = createSupabaseClient();
  console.log('Creating profiles table...');
  
  try {
    // 使用SQL创建表
    // 注意：这需要数据库管理员权限，普通用户可能无法执行
    const { error } = await supabase.rpc('create_profiles_table');
    
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