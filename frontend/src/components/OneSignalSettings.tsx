'use client';

import React, { useEffect, useState } from 'react';
import { useOneSignal } from '../hooks/useOneSignal';
import { Bell, BellOff, Settings, CheckCircle, XCircle, Mail } from 'lucide-react';
import OneSignalEmailSettings from './OneSignalEmailSettings';

interface OneSignalSettingsProps {
  className?: string;
  showAdvanced?: boolean;
}

export const OneSignalSettings: React.FC<OneSignalSettingsProps> = ({
  className = '',
  showAdvanced = false
}) => {
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  
  const {
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
  } = useOneSignal();

  // Kullanıcı etiketlerini güncelle
  const handleUpdateTags = async () => {
    if (!user?.playerId) {
      alert('Kullanıcı bilgileri yüklenemedi. Lütfen sayfayı yenileyin.');
      return;
    }

    try {
      const tags = {
        user_type: 'client', // veya 'consultant'
        consultant_id: '', // danışman ID'si
        service_category: 'general', // hizmet kategorisi
      };

      const success = await updateUserTags(tags);
      if (success) {
        alert('Kullanıcı etiketleri başarıyla güncellendi!');
      } else {
        alert('Kullanıcı etiketleri güncellenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Tag update error:', error);
      alert('Kullanıcı etiketleri güncellenirken bir hata oluştu.');
    }
  };

  // Segment'e ekleme/çıkarma
  const handleSegmentToggle = async (segment: string, add: boolean) => {
    if (!user?.playerId) {
      alert('Kullanıcı bilgileri yüklenemedi. Lütfen sayfayı yenileyin.');
      return;
    }

    try {
      if (add) {
        const success = await addToSegment(segment);
        if (success) {
          alert(`${segment} segmentine başarıyla eklendi!`);
        } else {
          alert(`${segment} segmentine eklenirken bir hata oluştu.`);
        }
      } else {
        const success = await removeFromSegment(segment);
        if (success) {
          alert(`${segment} segmentinden başarıyla çıkarıldı!`);
        } else {
          alert(`${segment} segmentinden çıkarılırken bir hata oluştu.`);
        }
      }
    } catch (error) {
      console.error('Segment toggle error:', error);
      alert('Segment işlemi sırasında bir hata oluştu.');
    }
  };

  // Debug bilgileri
  useEffect(() => {
    console.log('🔍 OneSignalSettings Debug:', {
      isInitialized,
      user,
      isLoading,
      showAdvanced
    });
  }, [isInitialized, user, isLoading, showAdvanced]);

  // Bildirim tıklama olayını dinle
  useEffect(() => {
    try {
      const unsubscribe = onNotificationClick((data) => {
        console.log('Notification clicked:', data);
        
        // Bildirim verilerine göre yönlendirme yap
        if (data.data?.action === 'view_appointment') {
          window.location.href = data.data.url || '/appointments';
        } else if (data.data?.action === 'book_new_appointment') {
          window.location.href = '/appointments/create';
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('Notification click listener error:', error);
      return () => {};
    }
  }, [onNotificationClick]);

  // Bildirim alındığında olayı dinle
  useEffect(() => {
    try {
      const unsubscribe = onNotificationReceived((data) => {
        console.log('Notification received:', data);
        
        // Ön planda bildirim göster
        if (Notification.permission === 'granted') {
          try {
            new Notification(data.title || 'Yeni Bildirim', {
              body: data.message || data.body || 'Bildirim içeriği',
              icon: '/favicon.ico',
              badge: '/favicon.ico',
            });
          } catch (error) {
            console.error('Notification creation error:', error);
          }
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('Notification received listener error:', error);
      return () => {};
    }
  }, [onNotificationReceived]);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bildirimler Yükleniyor</h3>
            <p className="text-gray-600 mb-4">OneSignal sistemi başlatılıyor...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Bu işlem birkaç saniye sürebilir</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center p-6">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Bildirim Sistemi Başlatılamadı</h3>
          <p className="text-gray-600 mb-4">OneSignal servisi şu anda kullanılamıyor</p>
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-500">• İnternet bağlantınızı kontrol edin</p>
            <p className="text-sm text-gray-500">• Tarayıcınızı yenileyin</p>
            <p className="text-sm text-gray-500">• Daha sonra tekrar deneyin</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center p-6">
          <XCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Kullanıcı Bilgileri Yüklenemedi</h3>
          <p className="text-gray-600 mb-4">Bildirim ayarlarını yapmak için giriş yapmanız gerekiyor</p>
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-500">• Oturumunuzun aktif olduğundan emin olun</p>
            <p className="text-sm text-gray-500">• Gerekirse tekrar giriş yapın</p>
            <p className="text-sm text-gray-500">• Tarayıcı konsolunda hata mesajlarını kontrol edin</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Settings className="h-5 w-5 mr-2 text-blue-600" />
          Bildirim Ayarları
        </h3>
        <div className="flex items-center space-x-2">
          {user?.isSubscribed ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <span className={`text-sm ${user?.isSubscribed ? 'text-green-600' : 'text-red-600'}`}>
            {user?.isSubscribed ? 'Aktif' : 'Pasif'}
          </span>
        </div>
      </div>

      {/* Bildirim İzni */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Bildirim İzni</h4>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            {user?.permission === 'granted' ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <span className="text-sm text-gray-600">
              {user?.permission === 'granted' 
                ? 'Bildirim izni verildi' 
                : 'Bildirim izni gerekli'
              }
            </span>
          </div>
          {user?.permission !== 'granted' && (
            <button
              onClick={requestPermission}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              İzin Ver
            </button>
          )}
        </div>
      </div>

      {/* Bildirim Aboneliği */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Bildirim Aboneliği</h4>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            {user?.isSubscribed ? (
              <Bell className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <BellOff className="h-5 w-5 text-red-500 mr-2" />
            )}
            <span className="text-sm text-gray-600">
              {user?.isSubscribed 
                ? 'Bildirimler aktif' 
                : 'Bildirimler kapalı'
              }
            </span>
          </div>
          <button
            onClick={toggleSubscription}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              user?.isSubscribed
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {user?.isSubscribed ? 'Kapat' : 'Aç'}
          </button>
        </div>
      </div>

      {/* Player ID */}
      {user?.playerId && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">Cihaz ID</h4>
          <div className="p-3 bg-gray-50 rounded-lg">
            <code className="text-xs text-gray-600 break-all">
              {user.playerId}
            </code>
          </div>
        </div>
      )}

      {/* Gelişmiş Ayarlar */}
      {showAdvanced && (
        <>
          {/* Kullanıcı Etiketleri */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Kullanıcı Etiketleri</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Danışman</span>
                <button
                  onClick={() => handleUpdateTags()}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  Güncelle
                </button>
              </div>
            </div>
          </div>

          {/* Segment Yönetimi */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Segment Yönetimi</h4>
            <div className="space-y-3">
              {['premium_user', 'new_user', 'active_user'].map((segment) => (
                <div key={segment} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600 capitalize">
                    {segment.replace('_', ' ')}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSegmentToggle(segment, true)}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                    >
                      Ekle
                    </button>
                    <button
                      onClick={() => handleSegmentToggle(segment, false)}
                      className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                    >
                      Çıkar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* E-posta Test */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">E-posta Testi</h4>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-sm text-gray-600">
              OneSignal e-posta entegrasyonunu test edin
            </span>
          </div>
          <button
            onClick={() => setShowEmailSettings(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Test Et
          </button>
        </div>
      </div>

      {/* Bilgi */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Bildirimler:</strong> Randevu hatırlatmaları, güncellemeler ve önemli bilgiler için kullanılır.
          Bildirimleri kapatarak istediğiniz zaman tekrar açabilirsiniz.
        </p>
      </div>

      {/* E-posta Ayarları Modal */}
      {showEmailSettings && (
        <OneSignalEmailSettings onClose={() => setShowEmailSettings(false)} />
      )}
    </div>
  );
};

export default OneSignalSettings;
