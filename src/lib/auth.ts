import { supabase } from './supabase';
import { buildUrl } from './utils';

export interface AuthError {
  message: string;
  code?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

// 密码验证规则
export const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return '密码长度至少为8位';
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return '密码必须包含至少一个小写字母';
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return '密码必须包含至少一个大写字母';
  }
  if (!/(?=.*\d)/.test(password)) {
    return '密码必须包含至少一个数字';
  }
  return null;
};

// 邮箱验证
export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return '请输入有效的邮箱地址';
  }
  return null;
};

// 登录
export const signIn = async ({ email, password }: LoginCredentials) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: getErrorMessage(error),
        code: error.code,
      } as AuthError,
    };
  }
};

// 注册
export const signUp = async ({ email, password }: RegisterCredentials) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: buildUrl('/auth/callback'),
      },
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: getErrorMessage(error),
        code: error.code,
      } as AuthError,
    };
  }
};

// 登出
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    return { error: null };
  } catch (error: any) {
    return {
      error: {
        message: getErrorMessage(error),
        code: error.code,
      } as AuthError,
    };
  }
};

// 发送重置密码邮件
export const sendPasswordResetEmail = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: buildUrl('/auth/reset-password'),
    });

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error: any) {
    return {
      error: {
        message: getErrorMessage(error),
        code: error.code,
      } as AuthError,
    };
  }
};

// 更新密码
export const updatePassword = async (password: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error: any) {
    return {
      error: {
        message: getErrorMessage(error),
        code: error.code,
      } as AuthError,
    };
  }
};

// 获取当前用户
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }

    return { user, error: null };
  } catch (error: any) {
    return {
      user: null,
      error: {
        message: getErrorMessage(error),
        code: error.code,
      } as AuthError,
    };
  }
};

// 获取会话
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }

    return { session, error: null };
  } catch (error: any) {
    return {
      session: null,
      error: {
        message: getErrorMessage(error),
        code: error.code,
      } as AuthError,
    };
  }
};

// 重新发送验证邮件
export const resendVerificationEmail = async (email: string) => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: buildUrl('/auth/callback'),
      },
    });

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error: any) {
    return {
      error: {
        message: getErrorMessage(error),
        code: error.code,
      } as AuthError,
    };
  }
};

// 错误消息映射
const getErrorMessage = (error: any): string => {
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': '邮箱或密码错误',
    'Email not confirmed': '邮箱未验证，请检查您的邮箱并点击验证链接',
    'User already registered': '该邮箱已被注册',
    'Password should be at least 6 characters': '密码长度至少为6位',
    'Unable to validate email address: invalid format': '邮箱格式无效',
    'Email rate limit exceeded': '邮件发送频率过高，请稍后再试',
    'Token has expired or is invalid': '链接已过期或无效，请重新申请',
    'New password should be different from the old password': '新密码不能与旧密码相同',
    'Password is too weak': '密码强度不够',
    'Signup is disabled': '注册功能已禁用',
    'Email link is invalid or has expired': '邮件链接无效或已过期',
    'User not found': '用户不存在',
    'Invalid email or password': '邮箱或密码错误',
  };

  return errorMessages[error.message] || error.message || '操作失败，请重试';
};

// 密码强度检查
export const getPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('至少8个字符');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('包含小写字母');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('包含大写字母');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('包含数字');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('包含特殊字符');
  }

  return { score, feedback };
};

// 检查认证状态
export const checkAuthStatus = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      isAuthenticated: !!session,
      user: session?.user || null,
      session,
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      user: null,
      session: null,
    };
  }
};