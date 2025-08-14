# 📧 OneSignal E-posta Entegrasyonu Kurulum Kılavuzu

Bu kılavuz, OneSignal'da e-posta entegrasyonunu aktif etmek ve randevu sistemine entegre etmek için adım adım talimatları içerir.

## 🎯 Genel Bakış

OneSignal e-posta entegrasyonu sayesinde:
- ✅ Randevu hatırlatmaları
- ✅ Randevu onayları
- ✅ Randevu güncellemeleri
- ✅ Randevu iptalleri
- ✅ AI önerileri

gibi e-postaları otomatik olarak gönderebilirsiniz.

## 🔧 1. OneSignal Dashboard'a Giriş

1. [OneSignal Dashboard](https://app.onesignal.com/) adresine gidin
2. Mevcut hesabınızla giriş yapın
3. **App ID:** `37be747a-043b-442e-88b6-097ee3f40714` olan uygulamayı seçin

## 📧 2. E-posta Entegrasyonu Kurulumu

### 2.1 SendGrid Hesabı Oluşturma
1. [SendGrid](https://sendgrid.com/) sitesine gidin
2. **"Start for Free"** butonuna tıklayın
3. Hesap bilgilerinizi doldurun ve kayıt olun
4. E-posta adresinizi doğrulayın

### 2.2 SendGrid API Key Oluşturma
1. SendGrid Dashboard'da **Settings > API Keys** menüsüne gidin
2. **"Create API Key"** butonuna tıklayın
3. **"Full Access"** veya **"Restricted Access"** (sadece Mail Send) seçin
4. **"Create & View"** butonuna tıklayın
5. API Key'i kopyalayın ve güvenli bir yere kaydedin

### 2.3 OneSignal'da SendGrid Bağlantısı
1. OneSignal Dashboard'da **Settings > Integrations** menüsüne gidin
2. **"Email"** sekmesini bulun ve tıklayın
3. **"Add Email Provider"** butonuna tıklayın
4. **"SendGrid"** seçeneğini seçin
5. **"API Key"** alanına SendGrid API Key'inizi yapıştırın
6. **"From Email"** alanına doğrulanmış e-posta adresinizi girin
7. **"From Name"** alanına "Randevu Sistemi" yazın
8. **"Save"** butonuna tıklayın

## 📝 3. E-posta Şablonları Oluşturma

### 3.1 Randevu Hatırlatması Şablonu
1. OneSignal'da **Settings > Message Templates** menüsüne gidin
2. **"Create Template"** butonuna tıklayın
3. **Template Name:** `randevu-hatirlatma`
4. **Subject:** `🔔 Randevu Hatırlatması - {{appointment_title}}`
5. **HTML Content:** Aşağıdaki şablonu kullanın:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Randevu Hatırlatması</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔔 Randevu Hatırlatması</h1>
    </div>
    
    <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
        <h2 style="color: #333; margin-top: 0;">Merhaba {{user_name}},</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
            <strong>{{appointment_title}}</strong> randevunuz yaklaşıyor!
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>📅 Tarih:</strong> {{appointment_date}}</p>
            <p style="margin: 5px 0;"><strong>⏰ Saat:</strong> {{appointment_time}}</p>
            <p style="margin: 5px 0;"><strong>👨‍💼 Danışman:</strong> {{consultant_name}}</p>
            <p style="margin: 5px 0;"><strong>📍 Lokasyon:</strong> {{location}}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{appointment_url}}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">Randevuyu Görüntüle</a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
            Bu e-posta otomatik olarak gönderilmiştir. Sorularınız için bizimle iletişime geçebilirsiniz.
        </p>
    </div>
    
    <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
        <p>© 2024 Randevu Sistemi. Tüm hakları saklıdır.</p>
    </div>
</body>
</html>
```

### 3.2 Diğer Şablonlar
Aynı şekilde şu şablonları da oluşturun:

- **Template Name:** `randevu-onay`
- **Template Name:** `randevu-guncelleme`
- **Template Name:** `randevu-iptal`
- **Template Name:** `ai-onerisi`

Her şablon için uygun subject ve HTML content kullanın.

## ⚙️ 4. Backend Konfigürasyonu

### 4.1 Environment Değişkenleri
`backend/.env` dosyasına şu değişkenleri ekleyin:

```env
# OneSignal Email Configuration
ONESIGNAL_EMAIL_ENABLED=true
ONESIGNAL_EMAIL_FROM_NAME=Randevu Sistemi
ONESIGNAL_EMAIL_FROM_ADDRESS=noreply@yourdomain.com

# OneSignal Email Templates
ONESIGNAL_TEMPLATE_APPOINTMENT_REMINDER=randevu-hatirlatma
ONESIGNAL_TEMPLATE_APPOINTMENT_CONFIRMATION=randevu-onay
ONESIGNAL_TEMPLATE_APPOINTMENT_UPDATE=randevu-guncelleme
ONESIGNAL_TEMPLATE_APPOINTMENT_CANCELLATION=randevu-iptal
ONESIGNAL_TEMPLATE_AI_RECOMMENDATION=ai-onerisi
```

### 4.2 Template ID'leri Güncelleme
OneSignal'da oluşturduğunuz şablonların ID'lerini environment değişkenlerinde güncelleyin.

## 🧪 5. Test Etme

### 5.1 Backend Test
```bash
cd backend
npm run dev
```

### 5.2 E-posta Test Endpoint'i
```bash
POST /api/test/send-onesignal-email
Content-Type: application/json

{
  "to": "test@example.com",
  "templateType": "confirmation"
}
```

### 5.3 Frontend Test
1. Uygulamayı başlatın: `npm run dev`
2. OneSignal ayarlarına gidin
3. **"E-posta Testi"** butonuna tıklayın
4. Test e-postası gönderin

## 🔍 6. Sorun Giderme

### 6.1 Yaygın Hatalar
- **"API Key invalid"**: SendGrid API Key'inizi kontrol edin
- **"Template not found"**: Template ID'lerini kontrol edin
- **"Email not sent"**: From e-posta adresinin doğrulandığından emin olun

### 6.2 Log Kontrolü
```bash
# Backend logları
tail -f backend/logs/combined.log

# OneSignal Dashboard'da Delivery Reports'u kontrol edin
```

### 6.3 Test E-postaları
- Spam klasörünü kontrol edin
- E-posta adresinin doğru olduğundan emin olun
- OneSignal Dashboard'da delivery status'u kontrol edin

## 📊 7. Monitoring ve Analytics

### 7.1 OneSignal Dashboard
- **Delivery Reports**: E-posta gönderim durumları
- **Analytics**: Açılma oranları, tıklanma oranları
- **Segments**: Kullanıcı grupları

### 7.2 SendGrid Dashboard
- **Activity**: E-posta gönderim logları
- **Statistics**: Gönderim istatistikleri
- **Bounces**: Geri dönen e-postalar

## 🚀 8. Production'a Geçiş

### 8.1 Domain Doğrulama
1. SendGrid'de domain'inizi doğrulayın
2. SPF, DKIM ve DMARC kayıtlarını ekleyin
3. From e-posta adresini domain'inizle güncelleyin

### 8.2 Rate Limiting
- SendGrid ücretsiz plan: 100 e-posta/gün
- OneSignal ücretsiz plan: 10,000 e-posta/ay
- Gerekirse ücretli planlara geçin

### 8.3 Backup Plan
- E-posta servisi çökerse alternatif servis hazırlayın
- Kritik bildirimler için SMS backup'ı düşünün

## 📚 9. Faydalı Linkler

- [OneSignal Email Documentation](https://documentation.onesignal.com/docs/email)
- [SendGrid API Documentation](https://sendgrid.com/docs/api-reference/)
- [Email Template Best Practices](https://sendgrid.com/blog/email-template-best-practices/)
- [OneSignal Pricing](https://onesignal.com/pricing)

## 🎉 10. Tamamlandı!

E-posta entegrasyonu başarıyla kuruldu! Artık randevu sistemi:
- Otomatik e-posta bildirimleri gönderebilir
- Profesyonel şablonlar kullanabilir
- Kullanıcı deneyimini iyileştirebilir
- Analytics ve monitoring yapabilir

Herhangi bir sorun yaşarsanız, logları kontrol edin ve OneSignal support ile iletişime geçin.
