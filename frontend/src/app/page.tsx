'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useOneSignal } from '../hooks/useOneSignal';
import { Bell, Calendar, Users, Brain, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { user, requestPermission, isInitialized } = useOneSignal();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token found:', !!token);
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Debug OneSignal durumu
  useEffect(() => {
    console.log('OneSignal Debug Info:');
    console.log('- isInitialized:', isInitialized);
    console.log('- user:', user);
    console.log('- user?.isSubscribed:', user?.isSubscribed);
    console.log('- user?.permission:', user?.permission);
  }, [isInitialized, user]);

  const handleEnableNotifications = async () => {
    console.log('Bildirimleri Aç butonuna tıklandı');
    const result = await requestPermission();
    console.log('Bildirim izni sonucu:', result);
  };

  // Show loading state briefly
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Randevu Sistemi</h1>
            </div>
            {isLoggedIn && (
              <nav className="hidden md:flex space-x-8">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Dashboard
                </Link>
                <Link href="/appointments" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Randevular
                </Link>
                <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Profil
                </Link>
              </nav>
            )}
            <div className="flex items-center space-x-4">
              {/* Bildirimleri Aç butonu - her zaman görünür (OneSignal hazır olduğunda) */}
              {isInitialized && (
                <>
                  {!user?.isSubscribed && (
                    <button
                      onClick={handleEnableNotifications}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Bildirimleri Aç
                    </button>
                  )}
                  {user?.isSubscribed && (
                    <div className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-lg">
                      <Bell className="w-4 h-4 mr-2" />
                      Bildirimler Aktif
                    </div>
                  )}
                </>
              )}
              
              {/* OneSignal henüz hazır değilse loading göster */}
              {!isInitialized && (
                <div className="flex items-center px-3 py-2 bg-gray-100 text-gray-600 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Bildirimler Yükleniyor...
                </div>
              )}
              
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Kayıt Ol
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI Destekli{' '}
            <span className="text-blue-600">Randevu Sistemi</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Yapay zeka teknolojisi ile randevu yönetimini kolaylaştırın. 
            Akıllı öneriler, otomatik hatırlatmalar ve gelişmiş analitikler ile 
            işinizi büyütün.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold flex items-center justify-center"
            >
              Ücretsiz Başla
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-lg font-semibold"
            >
              Demo İncele
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Destekli Öneriler</h3>
            <p className="text-gray-600">
              Yapay zeka ile en uygun randevu zamanlarını öğrenin ve 
              müşteri tercihlerini analiz edin.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Akıllı Bildirimler</h3>
            <p className="text-gray-600">
              OneSignal ile anlık push bildirimleri, hatırlatmalar ve 
              önemli güncellemeler alın.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Müşteri Yönetimi</h3>
            <p className="text-gray-600">
              Müşteri bilgilerini organize edin, geçmiş randevuları 
              takip edin ve ilişkileri güçlendirin.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 bg-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Hemen Başlayın
          </h2>
          <p className="text-xl mb-8 opacity-90">
            AI destekli randevu sistemimiz ile işinizi büyütün
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors text-lg font-semibold"
          >
            Ücretsiz Hesap Oluştur
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Randevu Sistemi</h3>
              <p className="text-gray-400">
                AI destekli modern randevu yönetim sistemi
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Özellikler</h4>
              <ul className="space-y-2 text-gray-400">
                <li>AI Önerileri</li>
                <li>Push Bildirimler</li>
                <li>Takvim Entegrasyonu</li>
                <li>Müşteri Yönetimi</li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Destek</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Dokümantasyon</li>
                <li>API Referansı</li>
                <li>İletişim</li>
                <li>SSS</li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">İletişim</h4>
              <p className="text-gray-400">
                info@randevusistemi.com<br />
                +90 xxx xxx xx xx
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Randevu Sistemi. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 