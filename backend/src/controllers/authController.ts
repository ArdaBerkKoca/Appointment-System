import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { generateToken } from '../middleware/auth';
import { validate, createUserSchema, loginSchema } from '../utils/validation';
import { CreateUserRequest, LoginRequest, ApiResponse, AuthResponse, AuthenticatedRequest } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userData = validate(createUserSchema, req.body) as CreateUserRequest;
  
  // Check if user already exists
  const existingUser = await UserModel.findByEmail(userData.email);
  if (existingUser) {
    res.status(400).json({
      success: false,
      error: 'User with this email already exists',
    } as ApiResponse);
    return;
  }
  
  // Create user
  const user = await UserModel.create(userData);
  
  // Generate token
  const token = generateToken(user);
  
  // Remove password from response
  const { password_hash, ...userWithoutPassword } = user;
  
  res.status(201).json({
    success: true,
    data: {
      user: userWithoutPassword,
      token,
    } as AuthResponse,
    message: 'User registered successfully',
  } as ApiResponse);
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const loginData = validate(loginSchema, req.body) as LoginRequest;
  
  // Find user by email
  const user = await UserModel.findByEmail(loginData.email);
  if (!user) {
    res.status(401).json({
      success: false,
      error: 'Invalid email or password',
    } as ApiResponse);
    return;
  }
  
  // Verify password
  const isValidPassword = await UserModel.verifyPassword(user, loginData.password);
  if (!isValidPassword) {
    res.status(401).json({
      success: false,
      error: 'Invalid email or password',
    } as ApiResponse);
    return;
  }
  
  // Check if user is verified
  if (!user.is_verified) {
    res.status(401).json({
      success: false,
      error: 'Please verify your email before logging in',
    } as ApiResponse);
    return;
  }
  
  // Generate token
  const token = generateToken(user);
  
  // Remove password from response
  const { password_hash, ...userWithoutPassword } = user;
  
  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      token,
    } as AuthResponse,
    message: 'Login successful',
  } as ApiResponse);
});

export const getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user;
  
  if (!user) {
    res.status(401).json({
      success: false,
      error: 'User not found',
    } as ApiResponse);
    return;
  }
  
  // Remove password from response
  const { password_hash, ...userWithoutPassword } = user;
  
  res.json({
    success: true,
    data: userWithoutPassword,
  } as ApiResponse);
});



export const changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id;
  const { currentPassword, newPassword } = req.body;
  
  if (!userId) {
    res.status(401).json({
      success: false,
      error: 'User not authenticated',
    } as ApiResponse);
    return;
  }
  
  if (!currentPassword || !newPassword) {
    res.status(400).json({
      success: false,
      error: 'Current password and new password are required',
    } as ApiResponse);
    return;
  }
  
  // Verify current password
  const user = await UserModel.findById(userId);
  if (!user) {
    res.status(404).json({
      success: false,
      error: 'User not found',
    } as ApiResponse);
    return;
  }
  
  const isValidPassword = await UserModel.verifyPassword(user, currentPassword);
  if (!isValidPassword) {
    res.status(401).json({
      success: false,
      error: 'Current password is incorrect',
    } as ApiResponse);
    return;
  }
  
  // Update password
  const success = await UserModel.updatePassword(userId, newPassword);
  
  if (!success) {
    res.status(500).json({
      success: false,
      error: 'Failed to update password',
    } as ApiResponse);
    return;
  }
  
  res.json({
    success: true,
    message: 'Password updated successfully',
  } as ApiResponse);
});

export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // In a stateless JWT system, logout is handled client-side
  // You could implement a blacklist for tokens if needed
  
  res.json({
    success: true,
    message: 'Logged out successfully',
  } as ApiResponse);
}); 