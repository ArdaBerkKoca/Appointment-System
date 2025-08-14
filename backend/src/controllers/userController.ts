import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';

export const getConsultants = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const consultants = await UserModel.getConsultants();
  
  // Eğer kullanıcı danışman ise, kendisini listeden çıkar
  let filteredConsultants = consultants;
  if (user && user.user_type === 'consultant') {
    filteredConsultants = consultants.filter((consultant: any) => consultant.id !== user.id);
  }
  
  return res.json({ success: true, data: filteredConsultants });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  const { password_hash, ...userData } = user;
  return res.json({ success: true, data: userData });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  const { full_name, phone } = req.body;
  const updated = await UserModel.update(user.id, { full_name, phone });
  if (!updated) {
    return res.status(400).json({ success: false, error: 'Profil güncellenemedi' });
  }
  const { password_hash, ...userData } = updated;
  return res.json({ success: true, data: userData });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ success: false, error: 'Mevcut ve yeni şifre gereklidir.' });
  }
  const isMatch = await UserModel.verifyPassword(user, current_password);
  if (!isMatch) {
    return res.status(400).json({ success: false, error: 'Mevcut şifre yanlış.' });
  }
  await UserModel.updatePassword(user.id, new_password);
  return res.json({ success: true, message: 'Şifre başarıyla değiştirildi.' });
});
