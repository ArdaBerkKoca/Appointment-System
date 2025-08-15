'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OneSignalSettings from '../../components/OneSignalSettings';
import Link from 'next/link';

interface UserData {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  user_type: 'consultant' | 'client';
}

export default function ProfilePage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchUserData();
  }, []); // router dependency'sini kaldırdık

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Profil - Token:', token ? 'Mevcut' : 'Yok');
      
      const response = await fetch('http://localhost:3001/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Profil - Response status:', response.status);
      console.log('Profil - Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Profil - User data received:', data);
        console.log('Profil - Form data setting:', {
          full_name: data.data.full_name || '',
          email: data.data.email || '',
          phone: data.data.phone || ''
        });
        
        setUserData(data.data);
        setFormData({
          full_name: data.data.full_name || '',
          email: data.data.email || '',
          phone: data.data.phone || ''
        });
        setIsReady(true);
        console.log('Profil yüklendi!');
      } else {
        console.error('Profil - API response not ok:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Profil - Error data:', errorData);
        setMessage('Kullanıcı bilgileri alınırken hata oluştu');
      }
    } catch (error) {
      console.error('Profil - Kullanıcı bilgileri alınırken hata:', error);
      setMessage('Kullanıcı bilgileri alınırken hata oluştu');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/users/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.data);
        setMessage('Profil başarıyla güncellendi!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Güncelleme sırasında hata oluştu');
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      setMessage('Güncelleme sırasında hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">Randevu Sistemi</h1>
            </div>
            
            {/* Navigation Menu */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <Link href="/appointments" className="text-gray-600 hover:text-gray-900 transition-colors">
                Randevularım
              </Link>
              <Link href="/calendar" className="text-gray-600 hover:text-gray-900 transition-colors">
                Takvim
              </Link>
              <Link href="/profile" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">
                Profil
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Ana Sayfa
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  router.push('/');
                }}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
          <p className="text-gray-600 mt-2">Hesap ve bildirim ayarlarınızı yönetin</p>
        </div>

        {/* Profil İşlemleri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <svg className="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-purple-900">Profil Düzenle</h3>
                <p className="text-purple-700">Kişisel bilgilerinizi güncelleyin</p>
              </div>
            </div>
          </div>
          
          <Link href="/profile/change-password" className="bg-orange-50 p-6 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
            <div className="flex items-center">
              <svg className="w-8 h-8 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-orange-900">Şifre Değiştir</h3>
                <p className="text-orange-700">Hesap güvenliğinizi artırın</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Mesaj Gösterimi */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.includes('başarıyla') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profil Bilgileri */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profil Bilgileri</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Adınız ve soyadınız"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="E-posta adresiniz"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Telefon numaranız"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 px-4 rounded-md transition-colors ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {isLoading ? 'Güncelleniyor...' : 'Güncelle'}
              </button>
            </form>
          </div>

          {/* Bildirim Ayarları */}
          <OneSignalSettings showAdvanced={true} />
        </div>
      </div>
    </div>
  );
}
