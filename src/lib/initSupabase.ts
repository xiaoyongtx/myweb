import { createSupabaseClient } from './supabase';

export async function initializeSupabaseSchema() {
  const supabase = createSupabaseClient();
  console.log('Initializing Supabase schema...');

  try {
    // 检查profiles表是否存在
    const { error: checkError } = await supabase.from('profiles').select('count').limit(1);
    
    if (checkError) {
      console.log('Profiles table does not exist, creating it...');
      
      // 创建profiles表
      const { error: createTableError } = await supabase.rpc('create_profiles_table');
      
      if (createTableError) {
        console.error('Error creating profiles table via RPC:', createTableError);
        console.log('Attempting to create profiles table directly...');
        
        // 如果RPC不存在，尝试直接执行SQL
        const { error: sqlError } = await supabase.rpc('execute_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS profiles (
              id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
              username TEXT,
              avatar_url TEXT,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
            
            -- Enable Row Level Security
            ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
            
            -- Create policies
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
        
        if (sqlError) {
          console.error('Error executing SQL directly:', sqlError);
          return false;
        }
      }
      
      console.log('Profiles table created successfully');
    } else {
      console.log('Profiles table already exists');
    }
    
    // 检查avatars存储桶是否存在
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking storage buckets:', bucketsError);
      return false;
    }
    
    const avatarBucketExists = buckets.some(bucket => bucket.name === 'avatars');
    
    if (!avatarBucketExists) {
      console.log('Avatars bucket does not exist, creating it...');
      
      const { error: createBucketError } = await supabase.storage.createBucket('avatars', {
        public: true
      });
      
      if (createBucketError) {
        console.error('Error creating avatars bucket:', createBucketError);
        return false;
      }
      
      console.log('Avatars bucket created successfully');
    } else {
      console.log('Avatars bucket already exists');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing Supabase schema:', error);
    return false;
  }
}

// 为当前用户创建个人资料
export async function createUserProfile(userId: string) {
  const supabase = createSupabaseClient();
  console.log('Creating user profile for:', userId);
  
  try {
    // 检查用户是否已有个人资料
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', checkError);
      return null;
    }
    
    if (existingProfile) {
      console.log('User profile already exists:', existingProfile);
      return existingProfile;
    }
    
    // 创建新的个人资料
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          username: null,
          avatar_url: null,
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating user profile:', insertError);
      return null;
    }
    
    console.log('User profile created successfully:', newProfile);
    return newProfile;
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return null;
  }
}