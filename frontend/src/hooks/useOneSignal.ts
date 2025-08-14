import { useState, useEffect, useCallback } from 'react';

// OneSignal global types
declare global {
  interface Window {
    OneSignal?: any;
    OneSignalV16?: any;
    OneSignalLoaded?: boolean;
    OneSignalState?: {
      isSubscribed: boolean;
      permission: string;
      playerId: string | null;
    };
  }
}

interface OneSignalUser {
  playerId: string | null;
  isSubscribed: boolean;
  permission: string;
}

export interface NotificationData {
  title: string;
  message: string;
  url?: string;
  data?: Record<string, any>;
}

export const useOneSignal = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<OneSignalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Debug bilgileri
  useEffect(() => {
    console.log('🔍 useOneSignal Debug State:', {
      isInitialized,
      user,
      isLoading,
      windowOneSignalLoaded: typeof window !== 'undefined' ? window.OneSignalLoaded : 'N/A',
      windowOneSignalV16: typeof window !== 'undefined' ? !!window.OneSignalV16 : 'N/A',
      windowOneSignalState: typeof window !== 'undefined' ? window.OneSignalState : 'N/A'
    });
  }, [isInitialized, user, isLoading]);

  // OneSignal'ı başlat - Yeni v16 SDK ile
  const initializeOneSignal = useCallback(async () => {
    try {
      console.log('🔄 OneSignal v16 başlatılıyor...');
      setIsLoading(true);
      
      // OneSignal v16 SDK'nın yüklenip yüklenmediğini kontrol et
      if (typeof window !== 'undefined' && !window.OneSignalV16) {
        console.error('❌ OneSignal v16 SDK yüklenmedi!');
        setIsLoading(false);
        return;
      }

      console.log('🔍 OneSignal v16 SDK mevcut:', !!window.OneSignalV16);
      
      // OneSignal v16 zaten init edilmiş, global state'den bilgileri al
      const OneSignal = window.OneSignalV16;
      
      // Global state'den bilgileri al
      if (window.OneSignalState) {
        const { isSubscribed, permission, playerId } = window.OneSignalState;
        
        setUser({
          playerId,
          isSubscribed,
          permission,
        });
        console.log('👤 Kullanıcı bilgileri global state\'den alındı');
      } else {
        // Global state yoksa manuel olarak kontrol et
        let isSubscribed = false, permission = 'default', playerId = null;
        
        try {
          // OneSignal v16'da push notification durumu kontrolü
          isSubscribed = await OneSignal.isPushNotificationsEnabled();
          console.log('🔔 Push notifications enabled:', isSubscribed);
        } catch (error: any) {
          console.error('❌ isPushNotificationsEnabled hatası:', error);
          isSubscribed = false;
        }

        try {
          // OneSignal v16'da izin durumu kontrolü
          permission = await OneSignal.getNotificationPermission();
          console.log('🔔 Notification permission:', permission);
        } catch (error: any) {
          console.error('❌ getNotificationPermission hatası:', error);
          permission = 'default';
        }
        
        try {
          // OneSignal v16'da user ID kontrolü
          playerId = await OneSignal.getUserId();
          console.log('🆔 OneSignal User ID:', playerId);
        } catch (error: any) {
          console.error('❌ getUserId hatası:', error);
          playerId = null;
        }
        
        // En azından temel bilgileri set et
        setUser({
          playerId,
          isSubscribed,
          permission,
        });
        console.log('👤 Kullanıcı bilgileri güncellendi (fallback)');
      }

      setIsInitialized(true);
      setIsLoading(false);
      console.log('🎉 OneSignal v16 initialization tamamlandı');
    } catch (error: any) {
      console.error('❌ OneSignal v16 initialization failed:', error);
      console.error('❌ Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      
      // Fallback olarak temel kullanıcı bilgilerini set et
      setUser({
        playerId: null,
        isSubscribed: false,
        permission: 'default'
      });
      
      setIsInitialized(true); // Hata olsa bile initialized olarak işaretle
      setIsLoading(false);
    }
  }, []);

  // OneSignal v16'ı başlat - deferred pattern ile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let timeoutId: NodeJS.Timeout;
      let retryCount = 0;
      const maxRetries = 15; // Daha fazla deneme
      
      // OneSignal v16 SDK'nın tamamen yüklenmesini bekle
      const waitForOneSignal = () => {
        if (window.OneSignalLoaded && window.OneSignalV16) {
          console.log('⏰ OneSignal v16 SDK hazır, initialization başlatılıyor...');
          initializeOneSignal();
        } else if (retryCount < maxRetries) {
          retryCount++;
          console.log(`⏳ OneSignal v16 SDK henüz hazır değil, bekleniyor... (${retryCount}/${maxRetries})`);
          timeoutId = setTimeout(waitForOneSignal, 1000);
        } else {
          console.error('❌ OneSignal v16 SDK yüklenemedi, maksimum deneme sayısına ulaşıldı');
          setIsLoading(false);
          // Kullanıcıya hata mesajı göster
          setUser(null);
        }
      };

      // 1 saniye sonra kontrol etmeye başla (daha hızlı)
      const timer = setTimeout(() => {
        console.log('⏰ OneSignal v16 SDK kontrol ediliyor...');
        waitForOneSignal();
      }, 1000);

      return () => {
        clearTimeout(timer);
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [initializeOneSignal]);

  // Bildirim izni iste
  const requestPermission = useCallback(async () => {
    if (!isInitialized) {
      console.error('❌ OneSignal henüz başlatılmadı!');
      alert('Bildirim sistemi henüz hazır değil. Lütfen bekleyin.');
      return false;
    }

    try {
      console.log('🔔 Bildirim izni isteniyor...');
      
      // OneSignal v16 SDK'da izin isteme
      const OneSignal = window.OneSignalV16;
      
      // Önce mevcut izni kontrol et
      let currentPermission;
      try {
        currentPermission = await OneSignal.getNotificationPermission();
        console.log('🔔 Mevcut izin:', currentPermission);
      } catch (error: any) {
        console.log('🔔 İzin kontrolü hatası, varsayılan olarak devam ediliyor');
        currentPermission = 'default';
      }
      
      if (currentPermission === 'granted') {
        console.log('✅ Bildirim izni zaten verilmiş');
        alert('Bildirim izni zaten verilmiş!');
        return true;
      }
      
      if (currentPermission === 'denied') {
        console.log('❌ Bildirim izni reddedilmiş');
        // Kullanıcıyı manuel olarak ayarlara yönlendir
        alert('Bildirim izni reddedilmiş. Lütfen tarayıcı ayarlarından bildirim iznini açın.');
        return false;
      }
      
      // İzin iste (default durumunda)
      console.log('🔔 Bildirim izni isteniyor...');
      
      try {
        // OneSignal v16'da izin isteme
        await OneSignal.showSlidedownPrompt();
        console.log('✅ Bildirim izni prompt gösterildi');
        
        // Kullanıcı durumunu güncelle
        const isSubscribed = await OneSignal.isPushNotificationsEnabled();
        const playerId = await OneSignal.getUserId();
        
        setUser(prev => ({
          ...prev,
          isSubscribed,
          permission: 'granted',
          playerId
        }));
        
        alert('Bildirim izni başarıyla alındı!');
        return true;
        
      } catch (permissionError: any) {
        // Kullanıcı prompt'u kapattıysa
        if (permissionError.message && permissionError.message.includes('dismissed')) {
          console.log('ℹ️ Kullanıcı bildirim izni prompt\'unu kapattı');
          alert('Bildirim izni için "İzin Ver" butonuna tıklamanız gerekiyor. Tekrar deneyin.');
          return false;
        }
        
        // Diğer hatalar
        console.error('❌ Bildirim izni hatası:', permissionError);
        alert('Bildirim izni alınırken bir hata oluştu. Lütfen tekrar deneyin.');
        return false;
      }
      
    } catch (error: any) {
      console.error('❌ Bildirim izni isteme hatası:', error);
      alert('Bildirim izni alınırken beklenmeyen bir hata oluştu.');
      return false;
    }
  }, [isInitialized]);

  // Bildirim aboneliğini aç/kapat
  const toggleSubscription = useCallback(async () => {
    if (!isInitialized) {
      console.error('❌ OneSignal henüz başlatılmadı!');
      alert('Bildirim sistemi henüz hazır değil. Lütfen bekleyin.');
      return false;
    }

    try {
      console.log('🔄 Bildirim aboneliği değiştiriliyor...');
      
      const OneSignal = window.OneSignalV16;
      const isSubscribed = await OneSignal.isPushNotificationsEnabled();
      
      if (isSubscribed) {
        // Aboneliği kapat
        console.log('🔕 Bildirim aboneliği kapatılıyor...');
        await OneSignal.setSubscription(false);
        console.log('✅ Bildirim aboneliği kapatıldı');
        
        setUser(prev => prev ? { ...prev, isSubscribed: false } : null);
        alert('Bildirimler başarıyla kapatıldı!');
        return false;
      } else {
        // Aboneliği aç
        console.log('🔔 Bildirim aboneliği açılıyor...');
        await OneSignal.setSubscription(true);
        console.log('✅ Bildirim aboneliği açıldı');
        
        setUser(prev => prev ? { ...prev, isSubscribed: true } : null);
        alert('Bildirimler başarıyla açıldı!');
        return true;
      }
      
    } catch (error: any) {
      console.error('❌ Bildirim aboneliği değiştirme hatası:', error);
      alert('Bildirim ayarları değiştirilirken bir hata oluştu. Lütfen tekrar deneyin.');
      return false;
    }
  }, [isInitialized]);

  // Kullanıcı etiketlerini güncelle
  const updateUserTags = useCallback(async (tags: Record<string, string>) => {
    try {
      if (!isInitialized) {
        await initializeOneSignal();
      }

      const OneSignal = window.OneSignalV16;
      if (!OneSignal) {
        console.error('❌ OneSignal SDK bulunamadı!');
        return false;
      }

      await OneSignal.sendTag('user_type', tags.user_type || 'client');
      await OneSignal.sendTag('consultant_id', tags.consultant_id || '');
      await OneSignal.sendTag('service_category', tags.service_category || '');
      
      console.log('✅ User tags updated successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Tag update failed:', error);
      return false;
    }
  }, [isInitialized, initializeOneSignal]);

  // Kullanıcıyı segment'e ekle
  const addToSegment = useCallback(async (segment: string) => {
    try {
      if (!isInitialized) {
        await initializeOneSignal();
      }

      const OneSignal = window.OneSignalV16;
      if (!OneSignal) {
        console.error('❌ OneSignal SDK bulunamadı!');
        return false;
      }

      await OneSignal.sendTag(segment, 'true');
      console.log(`✅ Added to segment: ${segment}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Add to segment failed: ${segment}`, error);
      return false;
    }
  }, [isInitialized, initializeOneSignal]);

  // Kullanıcıyı segment'ten çıkar
  const removeFromSegment = useCallback(async (segment: string) => {
    try {
      if (!isInitialized) {
        await initializeOneSignal();
      }

      const OneSignal = window.OneSignalV16;
      if (!OneSignal) {
        console.error('❌ OneSignal SDK bulunamadı!');
        return false;
      }

      await OneSignal.sendTag(segment, 'false');
      console.log(`✅ Removed from segment: ${segment}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Remove from segment failed: ${segment}`, error);
      return false;
    }
  }, [isInitialized, initializeOneSignal]);

  // Bildirim tıklama olayını dinle
  const onNotificationClick = useCallback((callback: (data: any) => void) => {
    if (!isInitialized) return () => {};

    try {
      const OneSignal = window.OneSignalV16;
      if (!OneSignal) {
        console.error('❌ OneSignal SDK bulunamadı!');
        return () => {};
      }

      OneSignal.on('notificationClick', callback);
      
      return () => {
        try {
          OneSignal.off('notificationClick', callback);
        } catch (error) {
          console.error('❌ Notification click listener cleanup error:', error);
        }
      };
    } catch (error: any) {
      console.error('❌ Notification click listener setup error:', error);
      return () => {};
    }
  }, [isInitialized]);

  // Bildirim alındığında olayı dinle
  const onNotificationReceived = useCallback((callback: (data: any) => void) => {
    if (!isInitialized) return () => {};

    try {
      const OneSignal = window.OneSignalV16;
      if (!OneSignal) {
        console.error('❌ OneSignal SDK bulunamadı!');
        return () => {};
      }

      OneSignal.on('notificationDisplay', callback);
      
      return () => {
        try {
          OneSignal.off('notificationDisplay', callback);
        } catch (error) {
          console.error('❌ Notification received listener cleanup error:', error);
        }
      };
    } catch (error: any) {
      console.error('❌ Notification received listener setup error:', error);
      return () => {};
    }
  }, [isInitialized]);

  return {
    isInitialized,
    user,
    isLoading,
    requestPermission,
    toggleSubscription,
    updateUserTags,
    addToSegment,
    removeFromSegment,
    onNotificationClick,
    onNotificationReceived,
  };
};
