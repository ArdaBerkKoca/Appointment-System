import getDatabase from '../config/database';
import { Appointment, CreateAppointmentRequest } from '../types';

export interface AppointmentWithUsers extends Appointment {
  consultant?: {
    full_name: string;
    email: string;
    hourly_rate?: number;
  };
  client?: {
    full_name: string;
    email: string;
  };
}

export class AppointmentModel {
  static async create(appointmentData: CreateAppointmentRequest, clientId: number): Promise<AppointmentWithUsers> {
    const { consultant_id, start_time, end_time, notes } = appointmentData;

    const db = getDatabase();
    const result = db.prepare(`
      INSERT INTO appointments (consultant_id, client_id, start_time, end_time, notes, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `).run(consultant_id, clientId, start_time, end_time, notes || null);

    const appointment = await this.findById(result.lastInsertRowid as number);
    if (!appointment) {
      throw new Error('Randevu oluşturulamadı');
    }
    return appointment;
  }

  static async updateTimes(id: number, startTime: string, endTime: string, resetStatusToPending: boolean = true): Promise<AppointmentWithUsers> {
    const db = getDatabase();
    const result = db.prepare(`
      UPDATE appointments 
      SET start_time = ?, end_time = ?, ${resetStatusToPending ? "status = 'pending'," : ''} updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(startTime, endTime, id);

    if (result.changes === 0) {
      throw new Error('Randevu güncellenemedi');
    }

    const appointment = await this.findById(id);
    if (!appointment) {
      throw new Error('Güncellenmiş randevu bulunamadı');
    }
    return appointment;
  }

  static async findByUser(userId: number, userType: string): Promise<AppointmentWithUsers[]> {
    let query = '';
    if (userType === 'consultant') {
      query = `
      SELECT a.*, 
               c.full_name as client_full_name, c.email as client_email,
               u.full_name as consultant_full_name, u.email as consultant_email, u.hourly_rate as consultant_hourly_rate
      FROM appointments a
        LEFT JOIN users c ON a.client_id = c.id
        LEFT JOIN users u ON a.consultant_id = u.id
        WHERE a.consultant_id = ? AND a.status IN ('confirmed','completed')
        ORDER BY a.start_time DESC
      `;
    } else {
      query = `
      SELECT a.*, 
               c.full_name as client_full_name, c.email as client_email,
               u.full_name as consultant_full_name, u.email as consultant_email, u.hourly_rate as consultant_hourly_rate
      FROM appointments a
        LEFT JOIN users c ON a.client_id = c.id
        LEFT JOIN users u ON a.consultant_id = u.id
        WHERE a.client_id = ?
      ORDER BY a.start_time DESC
    `;
    }

    const db = getDatabase();
    const appointments = db.prepare(query).all(userId) as any[];

    return appointments.map(appointment => ({
      id: appointment.id,
      consultant_id: appointment.consultant_id,
      client_id: appointment.client_id,
      start_time: new Date(appointment.start_time),
      end_time: new Date(appointment.end_time),
      status: appointment.status,
      notes: appointment.notes,
      created_at: new Date(appointment.created_at),
      updated_at: new Date(appointment.updated_at || appointment.created_at),
      consultant: {
        full_name: appointment.consultant_full_name,
        email: appointment.consultant_email,
        hourly_rate: appointment.consultant_hourly_rate
      },
      client: {
        full_name: appointment.client_full_name,
        email: appointment.client_email
      }
    }));
  }

  static async findById(id: number): Promise<AppointmentWithUsers | null> {
    const db = getDatabase();
    const appointment = db.prepare(`
      SELECT a.*, 
             c.full_name as client_full_name, c.email as client_email,
             u.full_name as consultant_full_name, u.email as consultant_email, u.hourly_rate as consultant_hourly_rate
      FROM appointments a
      LEFT JOIN users u ON a.consultant_id = u.id
      LEFT JOIN users c ON a.client_id = c.id
      WHERE a.id = ?
    `).get(id) as any;

    if (!appointment) return null;

    return {
      id: appointment.id,
      consultant_id: appointment.consultant_id,
      client_id: appointment.client_id,
      start_time: new Date(appointment.start_time),
      end_time: new Date(appointment.end_time),
      status: appointment.status,
      notes: appointment.notes,
      created_at: new Date(appointment.created_at),
      updated_at: new Date(appointment.updated_at || appointment.created_at),
      consultant: {
        full_name: appointment.consultant_full_name,
        email: appointment.consultant_email,
        hourly_rate: appointment.consultant_hourly_rate
      },
      client: {
        full_name: appointment.client_full_name,
        email: appointment.client_email
      }
    };
  }

  static async updateStatus(id: number, status: string): Promise<AppointmentWithUsers> {
    const db = getDatabase();
    const result = db.prepare(`
      UPDATE appointments 
      SET status = ?
      WHERE id = ?
    `).run(status, id);

    if (result.changes === 0) {
      throw new Error('Randevu güncellenemedi');
    }

    const appointment = await this.findById(id);
    if (!appointment) {
      throw new Error('Güncellenmiş randevu bulunamadı');
    }
    return appointment;
  }

  // Otomatik durum güncelleme fonksiyonu
  static async updateExpiredAppointments(): Promise<number> {
    const now = new Date().toISOString();
    
    const db = getDatabase();
    
    // Tarihi geçen pending randevuları 'expired' yap
    const expiredResult = db.prepare(`
      UPDATE appointments 
      SET status = 'expired'
      WHERE end_time < ? AND status = 'pending'
    `).run(now);

    // Tarihi geçen confirmed randevuları 'completed' yap
    const completedResult = db.prepare(`
      UPDATE appointments 
      SET status = 'completed'
      WHERE end_time < ? AND status = 'confirmed'
    `).run(now);

    return (expiredResult.changes || 0) + (completedResult.changes || 0);
  }

  // Belirli bir randevunun süresi dolmuş mu kontrol et
  static async isExpired(appointmentId: number): Promise<boolean> {
    const appointment = await this.findById(appointmentId);
    if (!appointment) return false;
    
    const now = new Date();
    return appointment.end_time < now;
  }

  // Belirli tarih aralığındaki randevuları bul
  static async findByDateRange(startDate: Date, endDate: Date): Promise<AppointmentWithUsers[]> {
    const query = `
      SELECT a.*, 
             c.full_name as client_name, c.email as client_email,
             u.full_name as consultant_name, u.email as consultant_email
      FROM appointments a
      LEFT JOIN users c ON a.client_id = c.id
      LEFT JOIN users u ON a.consultant_id = u.id
      WHERE a.start_time >= ? AND a.start_time < ?
      ORDER BY a.start_time ASC
    `;

    const db = getDatabase();
    const appointments = db.prepare(query).all(
      startDate.toISOString(),
      endDate.toISOString()
    ) as any[];

    return appointments.map(appointment => ({
      id: appointment.id,
      consultant_id: appointment.consultant_id,
      client_id: appointment.client_id,
      start_time: new Date(appointment.start_time),
      end_time: new Date(appointment.end_time),
      status: appointment.status,
      notes: appointment.notes,
      created_at: new Date(appointment.created_at),
      updated_at: new Date(appointment.updated_at || appointment.created_at),
      consultant: {
        full_name: appointment.consultant_name,
        email: appointment.consultant_email
      },
      client: {
        full_name: appointment.client_name,
        email: appointment.client_email
      }
    }));
  }
} 