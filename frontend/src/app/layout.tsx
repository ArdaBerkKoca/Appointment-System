import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Destekli Randevu Sistemi',
  description: 'Yapay zeka destekli modern randevu yönetim sistemi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        {/* OneSignal SDK yükleme kontrolü */}
        {/* OneSignal Script - Yeni v16 SDK */}
        <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.OneSignalDeferred = window.OneSignalDeferred || [];
              OneSignalDeferred.push(async function(OneSignal) {
                console.log('🚀 OneSignal v16 SDK başlatılıyor...');
                try {
                  await OneSignal.init({
                    appId: "37be747a-043b-442e-88b6-097ee3f40714",
                    serviceWorkerPath: "/OneSignalSDKWorker.js",
                    serviceWorkerParam: { scope: "/" },
                    allowLocalhostAsSecureOrigin: true,
                  });
                  console.log('✅ OneSignal v16 init başarılı!');
                  
                  // Global olarak OneSignal'ı işaretle
                  window.OneSignalLoaded = true;
                  window.OneSignalV16 = OneSignal;
                  
                  // Kullanıcı durumunu kontrol et
                  try {
                    const isSubscribed = await OneSignal.isPushNotificationsEnabled();
                    const permission = await OneSignal.getNotificationPermission();
                    const playerId = await OneSignal.getUserId();
                    
                    console.log('🔔 OneSignal v16 durumu:');
                    console.log('- isSubscribed:', isSubscribed);
                    console.log('- permission:', permission);
                    console.log('- playerId:', playerId);
                    
                    // Global state'i güncelle
                    window.OneSignalState = {
                      isSubscribed,
                      permission,
                      playerId
                    };
                    
                  } catch (statusError) {
                    console.error('❌ OneSignal v16 durum kontrolü hatası:', statusError);
                  }
                  
                } catch (error) {
                  console.error('❌ OneSignal v16 init hatası:', error);
                }
              });
            `
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
} 