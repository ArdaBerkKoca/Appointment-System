import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

// E-posta transporter konfigürasyonu
const createTransporter = () => {
  // Geliştirme için Gmail SMTP kullanıyoruz
  // Production'da gerçek SMTP ayarları kullanılmalı
  
  const emailUser = process.env.EMAIL_USER || 'your-email@gmail.com';
  const emailPass = process.env.EMAIL_PASS || 'your-app-password';
  
  console.log('🔧 Email transporter configuration:');
  console.log('  - Email user:', emailUser);
  console.log('  - Email pass configured:', !!emailPass);
  
  // Eğer email ayarları yoksa, test modunda çalış
  if (emailUser === 'your-email@gmail.com' || !emailPass) {
    console.log('⚠️ Email credentials not configured, using test mode');
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'test@example.com',
        pass: 'testpass'
      }
    });
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
};

// E-posta şablonları
export const emailTemplates = {
  appointmentCreated: {
    subject: 'Yeni Randevu Oluşturuldu',
    template: (data: any) => `
      <h2>Yeni Randevu Oluşturuldu</h2>
      <p>Sayın ${data.clientName},</p>
      <p>Randevunuz başarıyla oluşturulmuştur.</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>Randevu Detayları:</h3>
        <p><strong>Danışman:</strong> ${data.consultantName}</p>
        <p><strong>Tarih:</strong> ${data.date}</p>
        <p><strong>Saat:</strong> ${data.time}</p>
        <p><strong>Durum:</strong> ${data.status}</p>
      </div>
      <p>Randevu durumunuzu takip etmek için sisteme giriş yapabilirsiniz.</p>
      <p>Teşekkürler,<br>Randevu Sistemi</p>
    `
  },
  
  appointmentConfirmed: {
    subject: 'Randevunuz Onaylandı',
    template: (data: any) => `
      <h2>Randevunuz Onaylandı</h2>
      <p>Sayın ${data.clientName},</p>
      <p>Randevunuz danışmanınız tarafından onaylanmıştır.</p>
      <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>Randevu Detayları:</h3>
        <p><strong>Danışman:</strong> ${data.consultantName}</p>
        <p><strong>Tarih:</strong> ${data.date}</p>
        <p><strong>Saat:</strong> ${data.time}</p>
        <p><strong>Durum:</strong> Onaylandı</p>
      </div>
      <p>Randevu saatinde hazır olun.</p>
      <p>Teşekkürler,<br>Randevu Sistemi</p>
    `
  },
  
  appointmentReminder: {
    subject: 'Randevu Hatırlatması',
    template: (data: any) => `
      <h2>Randevu Hatırlatması</h2>
      <p>Sayın ${data.clientName},</p>
      <p>Yarın randevunuz var!</p>
      <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>Randevu Detayları:</h3>
        <p><strong>Danışman:</strong> ${data.consultantName}</p>
        <p><strong>Tarih:</strong> ${data.date}</p>
        <p><strong>Saat:</strong> ${data.time}</p>
      </div>
      <p>Randevu saatinde hazır olun.</p>
      <p>Teşekkürler,<br>Randevu Sistemi</p>
    `
  },
  
  appointmentCancelled: {
    subject: 'Randevu İptal Edildi',
    template: (data: any) => `
      <h2>Randevu İptal Edildi</h2>
      <p>Sayın ${data.clientName},</p>
      <p>Randevunuz iptal edilmiştir.</p>
      <div style="background: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>İptal Edilen Randevu:</h3>
        <p><strong>Danışman:</strong> ${data.consultantName}</p>
        <p><strong>Tarih:</strong> ${data.date}</p>
        <p><strong>Saat:</strong> ${data.time}</p>
      </div>
      <p>Yeni bir randevu oluşturmak için sisteme giriş yapabilirsiniz.</p>
      <p>Teşekkürler,<br>Randevu Sistemi</p>
    `
  }
};

// E-posta gönderme fonksiyonu
export const sendEmail = async (to: string, subject: string, htmlContent: string) => {
  try {
    console.log('🔍 Email sending attempt:');
    console.log('  - To:', to);
    console.log('  - Subject:', subject);
    console.log('  - From:', process.env.EMAIL_USER || 'noreply@randevusistemi.com');
    console.log('  - Email user configured:', !!process.env.EMAIL_USER);
    console.log('  - Email pass configured:', !!process.env.EMAIL_PASS);
    
    // Eğer email ayarları yoksa, sadece log yaz
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
        process.env.EMAIL_USER === 'your-email@gmail.com' || 
        process.env.EMAIL_PASS === 'your-app-password') {
      console.log('⚠️ Email credentials not configured, skipping email send');
      console.log('📧 Would send email to:', to);
      console.log('📧 Subject:', subject);
      console.log('📧 Content preview:', htmlContent.substring(0, 200) + '...');
      logger.info(`Email would be sent to ${to} (credentials not configured)`);
      return true; // Başarılı olarak işaretle
    }
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@randevusistemi.com',
      to: to,
      subject: subject,
      html: htmlContent
    };
    
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}: ${info.messageId}`);
    console.log('✅ Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    logger.error('Error sending email:', error);
    console.error('❌ Email sending failed:', error);
    return false;
  }
};

// Belirli bir şablon ile e-posta gönderme
export const sendTemplateEmail = async (to: string, templateName: keyof typeof emailTemplates, data: any) => {
  const template = emailTemplates[templateName];
  const htmlContent = template.template(data);
  
  return await sendEmail(to, template.subject, htmlContent);
};
