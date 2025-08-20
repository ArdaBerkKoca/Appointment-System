'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Mevcut şifre gereklidir';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Yeni şifre gereklidir';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Yeni şifre en az 6 karakter olmalıdır';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifre onayı gereklidir';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Yeni şifre mevcut şifre ile aynı olamaz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      if (response.ok) {
        setMessage('Şifreniz başarıyla değiştirildi!');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          router.push('/profile');
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Şifre değiştirme sırasında hata oluştu');
      }
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error);
      setMessage('Şifre değiştirme sırasında hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
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

      <div className="max-w-md mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Şifre Değiştir</h1>
          <p className="text-gray-600 mt-2">Hesap güvenliğinizi artırmak için şifrenizi değiştirin</p>
        </div>

        {/* Mesaj Gösterimi */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.includes('başarıyla') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center">
              {message.includes('başarıyla') && <CheckCircle className="w-5 h-5 mr-2" />}
              {message}
            </div>
          </div>
        )}

        {/* Şifre Değiştirme Formu */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mevcut Şifre
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Mevcut şifrenizi girin"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yeni Şifre
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Yeni şifrenizi girin"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yeni Şifre (Tekrar)
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Yeni şifrenizi tekrar girin"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
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
              {isLoading ? 'Şifre Değiştiriliyor...' : 'Şifreyi Değiştir'}
            </button>
          </form>
        </div>

        {/* Geri Dön Linki */}
        <div className="mt-6 text-center">
          <Link 
            href="/profile" 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Profile Geri Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
