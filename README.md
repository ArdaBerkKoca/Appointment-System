# 🤖 AI Destekli Randevu Sistemi

Danışmanlık hizmeti veren kişiler için yapay zeka destekli, modern randevu yönetim sistemi.

## 🚀 Özellikler

### Temel Özellikler
- ✅ Kullanıcı kayıt ve giriş sistemi
- ✅ Randevu oluşturma, düzenleme ve iptal etme
- ✅ Takvim entegrasyonu
- ✅ Otomatik bildirimler
- ✅ Ödeme sistemi entegrasyonu

### AI Özellikleri
- 🤖 Akıllı randevu önerileri
- 💬 AI Chatbot desteği
- 📊 Yoğunluk analizi
- 🎯 Kişiselleştirilmiş öneriler

### Entegrasyonlar
- 📅 Google Calendar
- 💳 Stripe/PayPal ödeme
- 📱 WhatsApp/SMS bildirimleri
- 🎥 Zoom/Google Meet video konferans

## 🛠️ Teknoloji Stack'i

### Backend
- **Node.js** + **Express.js**
- **TypeScript**
- **PostgreSQL**
- **Redis**
- **JWT Authentication**

### Frontend
- **React** + **TypeScript**
- **Next.js**
- **Tailwind CSS**
- **React Query**

### AI & Entegrasyonlar
- **OpenAI API**
- **Google Calendar API**
- **Stripe API**
- **Twilio API**

## 📦 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Backend Kurulumu
```bash
cd backend
npm install
npm run dev
```

### Frontend Kurulumu
```bash
cd frontend
npm install
npm run dev
```

## 🗄️ Veritabanı Şeması

```sql
-- Kullanıcılar tablosu
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    user_type ENUM('consultant', 'client') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Randevular tablosu
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    consultant_id INTEGER REFERENCES users(id),
    client_id INTEGER REFERENCES users(id),
    service_id INTEGER REFERENCES services(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Ortam Değişkenleri

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/appointment_system

# JWT
JWT_SECRET=your-secret-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Email
SENDGRID_API_KEY=your-sendgrid-api-key

# SMS
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
```

## 📱 API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/logout` - Çıkış

### Randevular
- `GET /api/appointments` - Randevuları listele
- `POST /api/appointments` - Yeni randevu oluştur
- `PUT /api/appointments/:id` - Randevu güncelle
- `DELETE /api/appointments/:id` - Randevu iptal et

### AI Endpoints
- `POST /api/ai/suggest` - AI randevu önerisi
- `POST /api/ai/chat` - AI chatbot
- `GET /api/ai/analytics` - AI analitik

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

# Appointment System

A modern, feature-rich appointment management system built with Next.js, Node.js, and OneSignal integration.

## Features
- 📅 Appointment scheduling and management
-    Push notifications and email reminders
- 🤖 AI-powered recommendations
- 🌍 Multilingual support (English/Turkish)
-    Responsive design
- 🔐 Secure authentication
- 📊 Dashboard and analytics

## Tech Stack
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript, SQLite
- **Notifications:** OneSignal (Push + Email)
- **AI:** OpenAI integration
- **Database:** SQLite with migrations

# Randevu Sistemi

Next.js, Node.js ve OneSignal entegrasyonu ile geliştirilmiş modern, özellik açısından zengin randevu yönetim sistemi.

## Özellikler
- 📅 Randevu planlama ve yönetimi
- 🔔 Push bildirimleri ve e-posta hatırlatmaları
- 🤖 AI destekli öneriler
-    Çok dilli destek (İngilizce/Türkçe)
-    Responsive tasarım
-    Güvenli kimlik doğrulama
- 📊 Kontrol paneli ve analitik

## Teknoloji Stack
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript, SQLite
- **Bildirimler:** OneSignal (Push + E-posta)
- **AI:** OpenAI entegrasyonu
- **Veritabanı:** SQLite ile migrations
