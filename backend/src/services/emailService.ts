import { sendTemplateEmail } from '../config/email';
import { UserModel } from '../models/User';
import { AppointmentWithUsers } from '../models/Appointment';
import { logger } from '../utils/logger';

export class EmailService {
  // Randevu oluşturulduğunda e-posta gönder
  static async sendAppointmentCreatedEmail(appointment: AppointmentWithUsers) {
    try {
      console.log('📧 Starting appointment created email process...');
      
      // Müşteri bilgilerini al
      const client = await UserModel.findById(appointment.client_id);
      const consultant = await UserModel.findById(appointment.consultant_id);
      
      console.log('👤 Client:', client?.email, client?.full_name);
      console.log('👨‍💼 Consultant:', consultant?.email, consultant?.full_name);
      
      if (!client || !consultant) {
        logger.error('Client or consultant not found for email notification');
        console.log('❌ Client or consultant not found');
        return false;
      }

      const emailData = {
        clientName: client.full_name,
        consultantName: consultant.full_name,
        date: appointment.start_time.toLocaleDateString('tr-TR'),
        time: appointment.start_time.toLocaleTimeString('tr-TR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: appointment.status
      };

      console.log('📧 Sending email to client:', client.email);
      // Müşteriye e-posta gönder
      const clientEmailResult = await sendTemplateEmail(client.email, 'appointmentCreated', emailData);
      console.log('📧 Client email result:', clientEmailResult);
      
      // Danışmana da bilgilendirme e-postası gönder
      const consultantEmailData = {
        clientName: client.full_name,
        consultantName: consultant.full_name,
        date: appointment.start_time.toLocaleDateString('tr-TR'),
        time: appointment.start_time.toLocaleTimeString('tr-TR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: 'Yeni randevu talebi'
      };
      
      console.log('📧 Sending email to consultant:', consultant.email);
      const consultantEmailResult = await sendTemplateEmail(consultant.email, 'appointmentCreated', consultantEmailData);
      console.log('📧 Consultant email result:', consultantEmailResult);
      
      logger.info(`Appointment created emails sent for appointment ${appointment.id}`);
      console.log('✅ Appointment created emails process completed');
      return true;
    } catch (error) {
      logger.error('Error sending appointment created email:', error);
      console.error('❌ Error in sendAppointmentCreatedEmail:', error);
      return false;
    }
  }

  // Randevu onaylandığında e-posta gönder
  static async sendAppointmentConfirmedEmail(appointment: AppointmentWithUsers) {
    try {
      const client = await UserModel.findById(appointment.client_id);
      const consultant = await UserModel.findById(appointment.consultant_id);
      
      if (!client || !consultant) {
        logger.error('Client or consultant not found for confirmation email');
        return false;
      }

      const emailData = {
        clientName: client.full_name,
        consultantName: consultant.full_name,
        date: appointment.start_time.toLocaleDateString('tr-TR'),
        time: appointment.start_time.toLocaleTimeString('tr-TR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };

      await sendTemplateEmail(client.email, 'appointmentConfirmed', emailData);
      
      logger.info(`Appointment confirmed email sent for appointment ${appointment.id}`);
      return true;
    } catch (error) {
      logger.error('Error sending appointment confirmed email:', error);
      return false;
    }
  }

  // Randevu iptal edildiğinde e-posta gönder
  static async sendAppointmentCancelledEmail(appointment: AppointmentWithUsers) {
    try {
      const client = await UserModel.findById(appointment.client_id);
      const consultant = await UserModel.findById(appointment.consultant_id);
      
      if (!client || !consultant) {
        logger.error('Client or consultant not found for cancellation email');
        return false;
      }

      const emailData = {
        clientName: client.full_name,
        consultantName: consultant.full_name,
        date: appointment.start_time.toLocaleDateString('tr-TR'),
        time: appointment.start_time.toLocaleTimeString('tr-TR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };

      await sendTemplateEmail(client.email, 'appointmentCancelled', emailData);
      
      logger.info(`Appointment cancelled email sent for appointment ${appointment.id}`);
      return true;
    } catch (error) {
      logger.error('Error sending appointment cancelled email:', error);
      return false;
    }
  }

  // Randevu hatırlatması e-postası gönder
  static async sendAppointmentReminderEmail(appointment: AppointmentWithUsers) {
    try {
      const client = await UserModel.findById(appointment.client_id);
      const consultant = await UserModel.findById(appointment.consultant_id);
      
      if (!client || !consultant) {
        logger.error('Client or consultant not found for reminder email');
        return false;
      }

      const emailData = {
        clientName: client.full_name,
        consultantName: consultant.full_name,
        date: appointment.start_time.toLocaleDateString('tr-TR'),
        time: appointment.start_time.toLocaleTimeString('tr-TR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };

      await sendTemplateEmail(client.email, 'appointmentReminder', emailData);
      
      logger.info(`Appointment reminder email sent for appointment ${appointment.id}`);
      return true;
    } catch (error) {
      logger.error('Error sending appointment reminder email:', error);
      return false;
    }
  }

  // Toplu hatırlatma e-postaları gönder
  static async sendBulkReminderEmails(appointments: AppointmentWithUsers[]) {
    const results = await Promise.allSettled(
      appointments.map(appointment => this.sendAppointmentReminderEmail(appointment))
    );
    
    const successful = results.filter(result => result.status === 'fulfilled' && result.value).length;
    const failed = results.length - successful;
    
    logger.info(`Bulk reminder emails sent: ${successful} successful, ${failed} failed`);
    
    return { successful, failed };
  }
}
