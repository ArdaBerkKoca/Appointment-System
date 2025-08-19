import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import getDatabase from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';

// Dashboard istatistiklerini getir
export const getDashboardStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Kullanıcı kimlik doğrulaması gerekli'
    });
  }

  const userId = Number(req.user.id);
  const userType = req.user.user_type;

  try {
    if (userType === 'consultant') {
      // Danışman dashboard istatistikleri
      const stats = await getConsultantStats(userId);
      return res.json({
        success: true,
        data: stats
      });
    } else {
      // Müşteri dashboard istatistikleri
      const stats = await getClientStats(userId);
      return res.json({
        success: true,
        data: stats
      });
    }
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Dashboard istatistikleri alınamadı'
    });
  }
});

// Danışman istatistikleri
async function getConsultantStats(consultantId: number) {
  const db = getDatabase();
  
  // Toplam randevu sayısı
  const totalAppointments = db.prepare(`
    SELECT COUNT(*) as count FROM appointments 
    WHERE consultant_id = ? AND status IN ('confirmed','completed')
  `).get(consultantId) as { count: number };

  // Toplam müşteri sayısı (unique)
  const totalClients = db.prepare(`
    SELECT COUNT(DISTINCT client_id) as count FROM appointments 
    WHERE consultant_id = ? AND status IN ('confirmed','completed')
  `).get(consultantId) as { count: number };

  // Bekleyen randevu sayısı
  const pendingAppointments = db.prepare(`
    SELECT COUNT(*) as count FROM appointments 
    WHERE consultant_id = ? AND status = 'pending'
  `).get(consultantId) as { count: number };

  // Toplam kazanç (tamamlanan randevular)
  const totalEarnings = db.prepare(`
    SELECT COUNT(*) as count FROM appointments 
    WHERE consultant_id = ? AND status = 'completed'
  `).get(consultantId) as { count: number };

  // Son randevular
  const recentAppointments = db.prepare(`
    SELECT 
      a.id,
      a.start_time,
      a.end_time,
      a.status,
      a.notes,
      u.full_name as client_name,
      u.email as client_email
    FROM appointments a
    JOIN users u ON a.client_id = u.id
    WHERE a.consultant_id = ? AND a.status IN ('confirmed','completed')
    ORDER BY a.start_time DESC
    LIMIT 5
  `).all(consultantId);

  return {
    totalAppointments: totalAppointments?.count || 0,
    totalClients: totalClients?.count || 0,
    pendingAppointments: pendingAppointments?.count || 0,
    totalEarnings: (totalEarnings?.count || 0) * 100, // Her randevu 100₺ varsayımı
    recentAppointments: recentAppointments
  };
}

// Müşteri istatistikleri
async function getClientStats(clientId: number) {
  const db = getDatabase();
  
  // Toplam randevu sayısı
  const totalAppointments = db.prepare(`
    SELECT COUNT(*) as count FROM appointments WHERE client_id = ?
  `).get(clientId) as { count: number };

  // Bekleyen randevu sayısı
  const pendingAppointments = db.prepare(`
    SELECT COUNT(*) as count FROM appointments 
    WHERE client_id = ? AND status = 'pending'
  `).get(clientId) as { count: number };

  // Onaylanan randevu sayısı
  const confirmedAppointments = db.prepare(`
    SELECT COUNT(*) as count FROM appointments 
    WHERE client_id = ? AND status = 'confirmed'
  `).get(clientId) as { count: number };

  // Tamamlanan randevu sayısı
  const completedAppointments = db.prepare(`
    SELECT COUNT(*) as count FROM appointments 
    WHERE client_id = ? AND status = 'completed'
  `).get(clientId) as { count: number };

  // Son randevular
  const recentAppointments = db.prepare(`
    SELECT 
      a.id,
      a.start_time,
      a.end_time,
      a.status,
      a.notes,
      u.full_name as consultant_name,
      u.email as consultant_email
    FROM appointments a
    JOIN users u ON a.consultant_id = u.id
    WHERE a.client_id = ?
    ORDER BY a.start_time DESC
    LIMIT 5
  `).all(clientId);

  return {
    totalAppointments: totalAppointments?.count || 0,
    pendingAppointments: pendingAppointments?.count || 0,
    confirmedAppointments: confirmedAppointments?.count || 0,
    completedAppointments: completedAppointments?.count || 0,
    recentAppointments: recentAppointments
  };
}
