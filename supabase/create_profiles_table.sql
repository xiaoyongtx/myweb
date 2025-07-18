-- 创建profiles表的SQL函数
CREATE OR REPLACE FUNCTION create_profiles_table()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 创建profiles表
  CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );
  
  -- 启用行级安全策略
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  
  -- 创建策略
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  CREATE POLICY "Users can view own profile" 
    ON public.profiles 
    FOR SELECT 
    USING (auth.uid() = id);
  
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  CREATE POLICY "Users can update own profile" 
    ON public.profiles 
    FOR UPDATE 
    USING (auth.uid() = id);
  
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
  CREATE POLICY "Users can insert own profile" 
    ON public.profiles 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating profiles table: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- 创建执行SQL的函数
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error executing SQL: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- 创建用户注册触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();