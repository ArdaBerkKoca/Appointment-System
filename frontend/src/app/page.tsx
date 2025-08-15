'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useOneSignal } from '../hooks/useOneSignal';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Bell, 
  Calendar, 
  Users, 
  Brain, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Shield, 
  Zap,
  Star,
  TrendingUp,
  Globe,
  Smartphone,
  Database,
  Lock
} from 'lucide-react';

export default function HomePage() {
  const { user, requestPermission, isInitialized } = useOneSignal();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

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
    
    // Intersection Observer for animations
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const heroSection = document.getElementById('hero-section');
    if (heroSection) {
      observer.observe(heroSection);
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      observer.disconnect();
    };
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleEnableNotifications = async () => {
    console.log('Bildirimleri Aç butonuna tıklandı');
    const result = await requestPermission();
    console.log('Bildirim izni sonucu:', result);
  };

  const features = [
    {
      icon: Brain,
      title: "AI Destekli Öneriler",
      description: "Yapay zeka ile en uygun randevu zamanlarını öğrenin ve müşteri tercihlerini analiz edin.",
      color: "blue",
      benefits: ["Akıllı zaman önerileri", "Müşteri davranış analizi", "Optimizasyon algoritmaları"]
    },
    {
      icon: Bell,
      title: "Akıllı Bildirimler",
      description: "OneSignal ile anlık push bildirimleri, hatırlatmalar ve önemli güncellemeler alın.",
      color: "green",
      benefits: ["Push bildirimler", "E-posta hatırlatmaları", "SMS entegrasyonu"]
    },
    {
      icon: Users,
      title: "Müşteri Yönetimi",
      description: "Müşteri bilgilerini organize edin, geçmiş randevuları takip edin ve ilişkileri güçlendirin.",
      color: "purple",
      benefits: ["Müşteri profilleri", "Randevu geçmişi", "İletişim yönetimi"]
    }
  ];

  const stats = [
    { number: "10K+", label: "Aktif Kullanıcı", icon: Users },
    { number: "50K+", label: "Randevu", icon: Calendar },
    { number: "99.9%", label: "Uptime", icon: Shield },
    { number: "24/7", label: "Destek", icon: Clock }
  ];

  const technologies = [
    { name: "Next.js 14", icon: Zap, description: "Modern React framework" },
    { name: "TypeScript", icon: Database, description: "Tip güvenli geliştirme" },
    { name: "Tailwind CSS", icon: TrendingUp, description: "Utility-first CSS" },
    { name: "PostgreSQL", icon: Lock, description: "Güçlü veritabanı" }
  ];

  // Show loading state briefly
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner 
          size="lg" 
          text="Randevu Sistemi Yükleniyor..." 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h1 className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Randevu Sistemi
              </h1>
            </div>
            
            {isLoggedIn && (
              <nav className="hidden md:flex space-x-8">
                <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                  Dashboard
                </Link>
                <Link href="/appointments" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                  Randevular
                </Link>
                <Link href="/profile" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                  Profil
                </Link>
              </nav>
            )}
            
            <div className="flex items-center space-x-4">
              {/* Bildirimleri Aç butonu */}
              {isInitialized && (
                <>
                  {!user?.isSubscribed && (
                    <button
                      onClick={handleEnableNotifications}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
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
              
              {!isInitialized && (
                <div className="flex items-center px-3 py-2 bg-gray-100 text-gray-600 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Bildirimler Yükleniyor...
                </div>
              )}
              
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="px-6 py-2 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-lg hover:from-gray-800 hover:to-gray-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-6 py-2 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-lg hover:from-gray-800 hover:to-gray-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-6 py-2 bg-white text-gray-900 border-2 border-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
        <div id="hero-section" className="hidden">
          <div className="mb-3">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-2">
              <Star className="w-4 h-4 mr-2" />
              Yapay Zeka Destekli
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-3 leading-tight">
            Modern{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Randevu Sistemi
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-4 max-w-4xl mx-auto leading-relaxed">
            Yapay zeka teknolojisi ile randevu yönetimini kolaylaştırın. 
            Akıllı öneriler, otomatik hatırlatmalar ve gelişmiş analitikler ile 
            işinizi büyütün.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link
              href="/auth/register"
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-lg font-semibold flex items-center justify-center transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              Ücretsiz Başla
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 hover:border-blue-700 transition-all duration-300 text-lg font-semibold transform hover:scale-105 shadow-lg"
            >
              Demo İncele
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Features */}
        <div className="mt-0">
          <div className="text-center mb-4">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Özellikler
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Modern teknolojiler ile güçlendirilmiş randevu yönetim sistemi
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`bg-white rounded-2xl shadow-lg p-8 text-center transition-all duration-500 transform hover:scale-105 hover:shadow-2xl cursor-pointer ${
                  activeFeature === index ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                }`}
                onClick={() => setActiveFeature(index)}
              >
                                 <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 transform ${
                   activeFeature === index ? 'scale-110' : ''
                 } ${
                   feature.color === 'blue' ? 'bg-gradient-to-br from-blue-100 to-blue-200' :
                   feature.color === 'green' ? 'bg-gradient-to-br from-green-100 to-green-200' :
                   'bg-gradient-to-br from-purple-100 to-purple-200'
                 }`}>
                   <feature.icon className={`w-10 h-10 ${
                     feature.color === 'blue' ? 'text-blue-600' :
                     feature.color === 'green' ? 'text-green-600' :
                     'text-purple-600'
                   }`} />
                 </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Benefits */}
                <div className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center justify-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Teknoloji Altyapısı
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              En güncel teknolojiler ile geliştirilmiş
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {technologies.map((tech, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <tech.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{tech.name}</h4>
                <p className="text-sm text-gray-600">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-6">
              Hemen Başlayın
            </h2>
            <p className="text-xl mb-6 opacity-90 max-w-2xl mx-auto">
              AI destekli modern randevu sistemimiz ile işinizi büyütün ve müşteri memnuniyetini artırın
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all duration-300 text-lg font-semibold transform hover:scale-105 shadow-xl"
            >
              Ücretsiz Hesap Oluştur
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="ml-2 text-lg font-semibold">Randevu Sistemi</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                AI destekli modern randevu yönetim sistemi ile işinizi büyütün
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Özellikler</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">AI Önerileri</li>
                <li className="hover:text-white transition-colors cursor-pointer">Push Bildirimler</li>
                <li className="hover:text-white transition-colors cursor-pointer">Takvim Entegrasyonu</li>
                <li className="hover:text-white transition-colors cursor-pointer">Müşteri Yönetimi</li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Destek</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Dokümantasyon</li>
                <li className="hover:text-white transition-colors cursor-pointer">API Referansı</li>
                <li className="hover:text-white transition-colors cursor-pointer">İletişim</li>
                <li className="hover:text-white transition-colors cursor-pointer">SSS</li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">İletişim</h4>
              <p className="text-gray-400 leading-relaxed">
                info@randevusistemi.com<br />
                +90 xxx xxx xx xx
              </p>
              <div className="flex space-x-4 mt-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <Smartphone className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Randevu Sistemi. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 