export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatResponse {
  text: string;
  suggestions?: string[];
  context?: string;
  language?: 'tr' | 'en';
}

// Çok dilli pattern matching ile çalışan chatbot
export class SimpleChatbot {
  private patterns: Array<{
    pattern: RegExp;
    responses: {
      tr: string;
      en: string;
    };
    suggestions: {
      tr: string[];
      en: string[];
    };
    context?: string;
  }> = [];

  private conversationHistory: Array<{
    userMessage: string;
    botResponse: string;
    context: string;
    language: 'tr' | 'en';
    timestamp: Date;
  }> = [];

  private currentContext: string = '';
  private currentLanguage: 'tr' | 'en' = 'tr';

  // Gelişmiş dil algılama
  private detectLanguage(message: string): 'tr' | 'en' {
    const turkishWords = [
      'randevu', 'nasıl', 'yardım', 'profil', 'şifre', 'bildirim', 'teşekkür', 'merhaba',
      'oluştur', 'görüntüle', 'düzenle', 'iptal', 'ücret', 'fiyat', 'ödeme', 'fatura',
      'danışman', 'uzman', 'tarih', 'saat', 'takvim', 'onayla', 'aç', 'kapat'
    ];
    
    const englishWords = [
      'appointment', 'how', 'help', 'profile', 'password', 'notification', 'thanks', 'hello',
      'create', 'view', 'edit', 'cancel', 'price', 'cost', 'payment', 'invoice',
      'consultant', 'expert', 'date', 'time', 'calendar', 'confirm', 'open', 'close'
    ];
    
    const messageLower = message.toLowerCase();
    let turkishCount = 0;
    let englishCount = 0;
    
    turkishWords.forEach(word => {
      if (messageLower.includes(word)) turkishCount++;
    });
    
    englishWords.forEach(word => {
      if (messageLower.includes(word)) englishCount++;
    });
    
    // Dil sayısına göre karar ver
    if (turkishCount > englishCount) {
      return 'tr';
    } else if (englishCount > turkishCount) {
      return 'en';
    } else {
      // Eşitse önceki dili koru
      return this.currentLanguage;
    }
  }

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns() {
    // Randevu oluşturma
    this.patterns.push({
      pattern: /(randevu|appointment|meeting)/i,
      responses: {
        tr: "Randevu işlemleri için:\n\n• **Oluşturma**: Dashboard'dan 'Yeni Randevu Oluştur' butonuna tıklayın\n• **Görüntüleme**: 'Randevularım' sayfasından tüm randevularınızı görebilirsiniz\n• **Düzenleme**: Randevu detay sayfasından düzenleyebilirsiniz\n• **İptal**: Sadece bekleyen randevular iptal edilebilir",
        en: "For appointment operations:\n\n• **Creation**: Click 'Create New Appointment' button from Dashboard\n• **Viewing**: View all your appointments from 'My Appointments' page\n• **Editing**: Edit from appointment detail page\n• **Cancellation**: Only pending appointments can be cancelled"
      },
      suggestions: {
        tr: ["Randevu oluştur", "Randevularımı gör", "Randevu iptal et", "Ücret bilgisi"],
        en: ["Create appointment", "View appointments", "Cancel appointment", "Price info"]
      },
      context: "randevu"
    });

    // Randevu durumları
    this.patterns.push({
      pattern: /(durum|status|beklemede|onaylandı|tamamlandı|iptal)/i,
      responses: {
        tr: "Randevu durumları:\n\n• **Beklemede**: Danışman onayını bekliyor\n• **Onaylandı**: Randevu onaylandı, hazırlanın\n• **Tamamlandı**: Randevu başarıyla tamamlandı\n• **İptal Edildi**: Randevu iptal edildi\n\nDurumları 'Randevularım' sayfasından takip edebilirsiniz.",
        en: "Appointment statuses:\n\n• **Pending**: Waiting for consultant approval\n• **Confirmed**: Appointment confirmed, get ready\n• **Completed**: Appointment successfully completed\n• **Cancelled**: Appointment cancelled\n\nTrack statuses from 'My Appointments' page."
      },
      suggestions: {
        tr: ["Randevu onaylama", "Durum güncelleme", "İptal politikası"],
        en: ["Appointment confirmation", "Status update", "Cancellation policy"]
      },
      context: "randevu_durum"
    });

    // Nasıl yapılır
    this.patterns.push({
      pattern: /(nasıl|how|yapılır|oluşturulur)/i,
      responses: {
        tr: "Randevu oluşturmak için:\n1. Dashboard'a gidin\n2. 'Yeni Randevu Oluştur' butonuna tıklayın\n3. Danışman seçin\n4. Tarih ve saat belirleyin\n5. Onaylayın",
        en: "To create an appointment:\n1. Go to Dashboard\n2. Click 'Create New Appointment' button\n3. Select consultant\n4. Set date and time\n5. Confirm"
      },
      suggestions: {
        tr: ["Randevu oluştur", "Dashboard'a git", "Danışman seç", "Tarih belirle"],
        en: ["Create appointment", "Go to Dashboard", "Select consultant", "Set date"]
      },
      context: "randevu_oluşturma"
    });

    // İptal
    this.patterns.push({
      pattern: /(iptal|cancel|iptal et)/i,
      responses: {
        tr: "Randevu iptal etmek için:\n1. Randevularım sayfasına gidin\n2. İptal etmek istediğiniz randevuyu bulun\n3. 'İptal Et' butonuna tıklayın\n4. Onaylayın",
        en: "To cancel an appointment:\n1. Go to My Appointments page\n2. Find the appointment you want to cancel\n3. Click 'Cancel' button\n4. Confirm"
      },
      suggestions: {
        tr: ["Randevularımı gör", "İptal politikası", "Geri ödeme", "Başka yardım"],
        en: ["View appointments", "Cancellation policy", "Refund", "Other help"]
      },
      context: "randevu_iptal"
    });

    // Ücret
    this.patterns.push({
      pattern: /(ücret|fiyat|price|cost|ödeme|payment)/i,
      responses: {
        tr: "Randevu ücretleri danışmanınıza göre değişiklik gösterir. Detaylı bilgi için danışman profiline bakabilir veya randevu oluştururken ücret bilgisini görebilirsiniz.",
        en: "Appointment fees vary according to your consultant. For detailed information, you can check the consultant profile or see the price information when creating an appointment."
      },
      suggestions: {
        tr: ["Danışman profili", "Randevu oluştur", "Ödeme yöntemleri", "Fatura bilgisi"],
        en: ["Consultant profile", "Create appointment", "Payment methods", "Invoice info"]
      },
      context: "ücret"
    });

    // Profil
    this.patterns.push({
      pattern: /(profil|profile|bilgi|güncelle)/i,
      responses: {
        tr: "Profil bilgilerinizi güncellemek için:\n1. Profil sayfasına gidin\n2. Bilgilerinizi düzenleyin\n3. 'Güncelle' butonuna tıklayın",
        en: "To update your profile information:\n1. Go to Profile page\n2. Edit your information\n3. Click 'Update' button"
      },
      suggestions: {
        tr: ["Profil düzenle", "Şifre değiştir", "Bildirim ayarları", "Hesap ayarları"],
        en: ["Edit profile", "Change password", "Notification settings", "Account settings"]
      },
      context: "profil"
    });

    // Bildirim
    this.patterns.push({
      pattern: /(bildirim|notification|uyarı|alert|mesaj|message)/i,
      responses: {
        tr: "Bildirim ayarlarınızı yönetmek için:\n1. Profil sayfasına gidin\n2. 'Bildirim Ayarları' bölümünü bulun\n3. OneSignal ayarlarını yapılandırın\n4. E-posta ve push bildirimleri için izin verin",
        en: "To manage your notification settings:\n1. Go to Profile page\n2. Find 'Notification Settings' section\n3. Configure OneSignal settings\n4. Allow email and push notifications"
      },
      suggestions: {
        tr: ["Bildirim ayarları", "E-posta bildirimleri", "Push bildirimleri", "Profil düzenle"],
        en: ["Notification settings", "Email notifications", "Push notifications", "Edit profile"]
      },
      context: "bildirim"
    });

    // Bildirim açma
    this.patterns.push({
      pattern: /(bildirim.*aç|notification.*on|bildirim.*gel|mesaj.*gel)/i,
      responses: {
        tr: "Bildirimleri açmak için:\n1. Profil sayfasına gidin\n2. 'Bildirim Ayarları' bölümünde OneSignal'ı etkinleştirin\n3. Tarayıcı izinlerini onaylayın\n4. E-posta adresinizi doğrulayın\n\nBildirimler randevu onayları, hatırlatmalar ve güncellemeler için kullanılır.",
        en: "To enable notifications:\n1. Go to Profile page\n2. Enable OneSignal in 'Notification Settings' section\n3. Approve browser permissions\n4. Verify your email address\n\nNotifications are used for appointment confirmations, reminders and updates."
      },
      suggestions: {
        tr: ["Bildirim aç", "E-posta ayarları", "Tarayıcı izinleri", "Profil düzenle"],
        en: ["Enable notifications", "Email settings", "Browser permissions", "Edit profile"]
      },
      context: "bildirim_açma"
    });

    // Şifre
    this.patterns.push({
      pattern: /(şifre|password|güvenlik|security)/i,
      responses: {
        tr: "Şifrenizi değiştirmek için:\n1. Profil sayfasına gidin\n2. 'Şifre Değiştir' kartına tıklayın\n3. Mevcut ve yeni şifrenizi girin\n4. Onaylayın",
        en: "To change your password:\n1. Go to Profile page\n2. Click 'Change Password' card\n3. Enter current and new password\n4. Confirm"
      },
      suggestions: {
        tr: ["Şifre değiştir", "Güvenlik ayarları", "Profil düzenle", "Hesap güvenliği"],
        en: ["Change password", "Security settings", "Edit profile", "Account security"]
      },
      context: "şifre"
    });

    // Genel yardım
    this.patterns.push({
      pattern: /(yardım|help|destek|support)/i,
      responses: {
        tr: "Size yardımcı olmaktan mutluluk duyarım! Hangi konuda yardıma ihtiyacınız var?\n\n• Randevu oluşturma\n• Profil yönetimi\n• Şifre değiştirme\n• Bildirim ayarları\n• Randevu iptal etme\n• Ücret bilgileri",
        en: "I'm happy to help you! What topic do you need help with?\n\n• Create appointment\n• Profile management\n• Change password\n• Notification settings\n• Cancel appointment\n• Price information"
      },
      suggestions: {
        tr: ["Randevu oluştur", "Profil düzenle", "Bildirim ayarları", "Randevu iptal et"],
        en: ["Create appointment", "Edit profile", "Notification settings", "Cancel appointment"]
      },
      context: "genel_yardım"
    });

    // Selamlaşma
    this.patterns.push({
      pattern: /(merhaba|selam|hello|hi|hey)/i,
      responses: {
        tr: "Merhaba! Randevu sisteminde size nasıl yardımcı olabilirim?",
        en: "Hello! How can I help you in the appointment system?"
      },
      suggestions: {
        tr: ["Randevu oluştur", "Yardım al", "Profil düzenle"],
        en: ["Create appointment", "Get help", "Edit profile"]
      },
      context: "selamlaşma"
    });

    // Teşekkür
    this.patterns.push({
      pattern: /(teşekkür|thanks|thank you|sağol)/i,
      responses: {
        tr: "Rica ederim! Başka bir konuda yardıma ihtiyacınız olursa bana sorabilirsiniz.",
        en: "You're welcome! If you need help with another topic, you can ask me."
      },
      suggestions: {
        tr: ["Başka sorum var", "Randevu oluştur", "Profil düzenle"],
        en: ["I have another question", "Create appointment", "Edit profile"]
      },
      context: "teşekkür"
    });

    // Varsayılan yanıt
    this.patterns.push({
      pattern: /.*/,
      responses: {
        tr: "Anlıyorum. Size daha iyi yardımcı olabilmem için sorunuzu farklı bir şekilde ifade edebilir misiniz?",
        en: "I understand. Could you express your question differently so I can help you better?"
      },
      suggestions: {
        tr: ["Randevu oluştur", "Yardım al", "Profil düzenle"],
        en: ["Create appointment", "Get help", "Edit profile"]
      },
      context: "varsayılan"
    });
  }

  public getResponse(userMessage: string): ChatResponse {
    const message = userMessage.toLowerCase().trim();
    const detectedLanguage = this.detectLanguage(userMessage);
    
    // Dil değişikliğini kaydet
    this.currentLanguage = detectedLanguage;

    // Context memory'den önceki konuşmayı kontrol et
    const contextAwareResponse = this.getContextAwareResponse(userMessage, detectedLanguage);
    if (contextAwareResponse) {
      return contextAwareResponse;
    }

    for (const pattern of this.patterns) {
      const matches = message.match(pattern.pattern);
      if (matches) {
        // Dile göre cevap ve önerileri seç
        const responseText = detectedLanguage === 'en' ? pattern.responses.en : pattern.responses.tr;
        const suggestions = detectedLanguage === 'en' ? pattern.suggestions.en : pattern.suggestions.tr;

        // Context'i güncelle ve geçmişe ekle
        this.currentContext = pattern.context || '';
        this.addToHistory(userMessage, responseText, pattern.context || '', detectedLanguage);

        return {
          text: responseText,
          suggestions: suggestions,
          context: pattern.context,
          language: detectedLanguage
        };
      }
    }

    // Hiçbir pattern eşleşmezse varsayılan yanıt
    const defaultResponse = detectedLanguage === 'en' 
      ? "Sorry, I couldn't understand your question exactly. How can I help you?"
      : "Üzgünüm, sorunuzu tam olarak anlayamadım. Size nasıl yardımcı olabilirim?";

    const defaultSuggestions = detectedLanguage === 'en'
      ? ["Create appointment", "Get help", "Edit profile"]
      : ["Randevu oluştur", "Yardım al", "Profil düzenle"];

    return {
      text: defaultResponse,
      suggestions: defaultSuggestions,
      context: "varsayılan",
      language: detectedLanguage
    };
  }

  public getWelcomeMessage(): ChatResponse {
    // Mevcut dile göre karşılama mesajı
    const isEnglish = this.currentLanguage === 'en';
    
    return {
      text: isEnglish 
        ? "Hello! I'm your Appointment System assistant. How can I help you?\n\n• Create appointment\n• Profile management\n• Change password\n• General help"
        : "Merhaba! Ben Randevu Sistemi asistanınız. Size nasıl yardımcı olabilirim?\n\n• Randevu oluşturma\n• Profil yönetimi\n• Şifre değiştirme\n• Genel yardım",
      suggestions: isEnglish 
        ? ["Create appointment", "Get help", "Edit profile"]
        : ["Randevu oluştur", "Yardım al", "Profil düzenle"],
      context: "karşılama",
      language: this.currentLanguage
    };
  }

  // Context memory fonksiyonları
  private getContextAwareResponse(userMessage: string, language: 'tr' | 'en'): ChatResponse | null {
    const message = userMessage.toLowerCase().trim();
    
    // Eğer önceki konuşma randevu ile ilgiliyse ve kullanıcı "nasıl" diyorsa
    if (this.currentContext.includes('randevu') && /(nasıl|how|yapılır)/i.test(message)) {
      const response = language === 'en'
        ? "Appointment creation steps:\n\n1. Go to Dashboard\n2. Click 'Create New Appointment' button\n3. Select consultant\n4. Set date and time\n5. Confirm\n\nWhich step do you need help with?"
        : "Randevu oluşturma adımları:\n\n1. Dashboard'a gidin\n2. 'Yeni Randevu Oluştur' butonuna tıklayın\n3. Danışman seçin\n4. Tarih ve saat belirleyin\n5. Onaylayın\n\nHangi adımda yardıma ihtiyacınız var?";
      
      const suggestions = language === 'en'
        ? ["Consultant selection", "Date setting", "Confirmation", "Other question"]
        : ["Danışman seçimi", "Tarih belirleme", "Onaylama", "Başka sorum var"];

      return {
        text: response,
        suggestions: suggestions,
        context: "randevu_nasıl",
        language: language
      };
    }

    // Eğer önceki konuşma bildirim ile ilgiliyse ve kullanıcı "aç" diyorsa
    if (this.currentContext.includes('bildirim') && /(aç|on|etkinleştir|enable)/i.test(message)) {
      const response = language === 'en'
        ? "To enable notifications:\n\n1. Go to Profile page\n2. Enable OneSignal in 'Notification Settings' section\n3. Approve browser permissions\n4. Verify your email address\n\nNotifications are used for appointment confirmations, reminders and updates."
        : "Bildirimleri açmak için:\n\n1. Profil sayfasına gidin\n2. 'Bildirim Ayarları' bölümünde OneSignal'ı etkinleştirin\n3. Tarayıcı izinlerini onaylayın\n4. E-posta adresinizi doğrulayın\n\nBildirimler randevu onayları, hatırlatmalar ve güncellemeler için kullanılır.";
      
      const suggestions = language === 'en'
        ? ["Enable notifications", "Email settings", "Browser permissions", "Edit profile"]
        : ["Bildirim aç", "E-posta ayarları", "Tarayıcı izinleri", "Profil düzenle"];

      return {
        text: response,
        suggestions: suggestions,
        context: "bildirim_açma",
        language: language
      };
    }

    return null;
  }

  private addToHistory(userMessage: string, botResponse: string, context: string, language: 'tr' | 'en'): void {
    this.conversationHistory.push({
      userMessage,
      botResponse,
      context,
      language,
      timestamp: new Date()
    });

    // Geçmişi 10 mesajla sınırla
    if (this.conversationHistory.length > 10) {
      this.conversationHistory.shift();
    }
  }

  // Geçmiş konuşmaları temizle
  public clearHistory(): void {
    this.conversationHistory = [];
    this.currentContext = '';
  }

  // Son konuşma bağlamını al
  public getCurrentContext(): string {
    return this.currentContext;
  }

  // Mevcut dili al
  public getCurrentLanguage(): 'tr' | 'en' {
    return this.currentLanguage;
  }
}

// Chatbot instance'ı
export const chatbot = new SimpleChatbot();
