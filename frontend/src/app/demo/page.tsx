'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  Users, 
  Brain, 
  Bell, 
  CheckCircle, 
  ArrowRight,
  Star,
  Zap,
  Shield,
  TrendingUp
} from 'lucide-react';

export default function DemoPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const demoSteps = [
    {
      title: "Randevu Oluşturma",
      description: "Sadece birkaç tıklama ile yeni randevu oluşturun",
      icon: Calendar,
      features: ["Danışman seçimi", "Tarih ve saat belirleme", "Otomatik müsaitlik kontrolü"]
    },
    {
      title: "AI Önerileri",
      description: "Yapay zeka en uygun zamanları önerir",
      icon: Brain,
      features: ["Akıllı zaman önerileri", "Müşteri tercih analizi", "Çakışma önleme"]
    },
    {
      title: "Bildirim Sistemi",
      description: "Otomatik hatırlatmalar ve güncellemeler",
      icon: Bell,
      features: ["Push bildirimler", "E-posta hatırlatmaları", "SMS entegrasyonu"]
    },
    {
      title: "Takvim Görünümü",
      description: "Tüm randevularınızı tek yerden yönetin",
      icon: Clock,
      features: ["Günlük/haftalık/aylık görünüm", "Sürükle-bırak düzenleme", "Renk kodlu kategoriler"]
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Hızlı Kurulum",
      description: "5 dakikada sistemi kullanmaya başlayın"
    },
    {
      icon: Shield,
      title: "Güvenli",
      description: "End-to-end şifreleme ve güvenlik standartları"
    },
    {
      icon: TrendingUp,
      title: "Ölçeklenebilir",
      description: "Küçük işletmeden büyük kuruma kadar"
    },
    {
      icon: Users,
      title: "Kullanıcı Dostu",
      description: "Sezgisel arayüz ve kolay kullanım"
    }
  ];

  const startDemo = () => {
    setIsPlaying(true);
    let step = 0;
    const interval = setInterval(() => {
      setActiveStep(step);
      step++;
      if (step >= demoSteps.length) {
        clearInterval(interval);
        setIsPlaying(false);
        setActiveStep(0);
      }
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h1 className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Randevu Sistemi
              </h1>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/register"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Ücretsiz Başla
              </Link>
              <Link
                href="/"
                className="px-6 py-2 bg-white text-gray-900 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
              >
                Ana Sayfa
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4 mr-2" />
            Canlı Demo
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Sistemi{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Deneyin
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Randevu sistemimizin nasıl çalıştığını keşfedin. 
            Modern arayüz, akıllı özellikler ve kullanıcı dostu tasarım.
          </p>
          
          <button
            onClick={startDemo}
            disabled={isPlaying}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-lg font-semibold flex items-center justify-center mx-auto transform hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaying ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Demo Çalışıyor...
              </>
            ) : (
              <>
                Demo Başlat
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </div>

        {/* Interactive Demo */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Canlı Demo
            </h2>
            <p className="text-gray-600">
              Sistemi adım adım keşfedin
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Demo Steps */}
            <div className="space-y-4">
              {demoSteps.map((step, index) => (
                <div 
                  key={index}
                  className={`p-6 rounded-2xl border-2 transition-all duration-500 cursor-pointer ${
                    activeStep === index 
                      ? 'border-blue-500 bg-blue-50 shadow-lg' 
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      activeStep === index 
                        ? 'bg-blue-600 text-white scale-110' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg transition-colors duration-300 ${
                        activeStep === index ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {step.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {step.description}
                      </p>
                    </div>
                    {activeStep === index && (
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  
                  {/* Features */}
                  {activeStep === index && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <div className="grid grid-cols-1 gap-2">
                        {step.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center text-sm text-gray-700">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Demo Preview */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-400">Demo Önizleme</span>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-gray-900">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {React.createElement(demoSteps[activeStep]?.icon || Calendar, { 
                      className: "w-8 h-8 text-blue-600" 
                    })}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {demoSteps[activeStep]?.title || "Demo"}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {demoSteps[activeStep]?.description || "Demo başlatmak için butona tıklayın"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Neden Biz?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Modern teknolojiler ile güçlendirilmiş randevu yönetim sistemi
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4">
              Hemen Başlayın
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Demo'yu beğendiniz mi? Hemen ücretsiz hesap oluşturun ve sistemi kullanmaya başlayın!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all duration-300 text-lg font-semibold transform hover:scale-105 shadow-xl"
              >
                Ücretsiz Hesap Oluştur
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300 text-lg font-semibold"
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            &copy; 2024 Randevu Sistemi. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
