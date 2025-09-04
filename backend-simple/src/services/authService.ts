import { supabase, supabaseAdmin } from '../config/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin' | 'operator';
  is_verified: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: User;
    token?: string;
  };
  error?: string;
}

class AuthService {
  // Register new user
  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists',
          error: 'EMAIL_EXISTS'
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone
          }
        }
      });

      if (authError) {
        return {
          success: false,
          message: authError.message,
          error: 'AUTH_ERROR'
        };
      }

      // Create user record in our users table
      const { data: user, error: dbError } = await supabase
        .from('users')
        .insert({
          id: authData.user!.id,
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          role: 'user',
          is_verified: false
        })
        .select()
        .single();

      if (dbError) {
        return {
          success: false,
          message: 'Failed to create user profile',
          error: 'DB_ERROR'
        };
      }

      return {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: { user }
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Login user
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        return {
          success: false,
          message: 'Invalid email or password',
          error: 'INVALID_CREDENTIALS'
        };
      }

      // Get user profile
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError || !user) {
        return {
          success: false,
          message: 'User profile not found',
          error: 'USER_NOT_FOUND'
        };
      }

      // Generate custom JWT token with user role
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        config.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        success: true,
        message: 'Login successful',
        data: {
          user,
          token
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(userId: string, updates: {
    name?: string;
    phone?: string;
    avatar_url?: string;
  }): Promise<AuthResponse> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          message: 'Failed to update profile',
          error: 'UPDATE_ERROR'
        };
      }

      return {
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: 'Profile update failed',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Verify JWT token
  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      return await this.getUserById(decoded.id);
    } catch (error) {
      return null;
    }
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      // Get user's current auth data
      const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        };
      }

      // Update password with Supabase Auth
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword
      });

      if (error) {
        return {
          success: false,
          message: 'Failed to change password',
          error: 'PASSWORD_UPDATE_ERROR'
        };
      }

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'Password change failed',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${config.FRONTEND_URL}/reset-password`
      });

      if (error) {
        return {
          success: false,
          message: 'Failed to send reset email',
          error: 'RESET_ERROR'
        };
      }

      return {
        success: true,
        message: 'Password reset email sent successfully'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'Password reset failed',
        error: 'INTERNAL_ERROR'
      };
    }
  }
}

export const authService = new AuthService();
