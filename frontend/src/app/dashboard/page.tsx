'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useOneSignal } from '../../hooks/useOneSignal';
import { Bell, BellOff, Calendar, Plus, Users, Clock, CheckCircle, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  const { user, isInitialized } = useOneSignal();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [userType, setUserType] = useState<'consultant' | 'client' | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
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
      console.log('Token:', token ? 'Mevcut' : 'Yok');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      console.log('API çağrısı yapılıyor...');
      const response = await fetch('http://localhost:3001/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('User data received:', data);
        console.log('User type:', data.data.user_type);
        setUserType(data.data.user_type || 'client');
        setUserData(data.data);
    setIsReady(true);
        console.log('Dashboard yüklendi!');
        
        // Dashboard istatistiklerini çek
        fetchDashboardStats();
      } else {
        console.error('API response not ok:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error data:', errorData);
        setMessage('Kullanıcı bilgileri alınamadı');
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri alınırken hata:', error);
      setMessage('Bağlantı hatası oluştu');
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3001/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard stats received:', data);
        setDashboardStats(data.data);
      } else {
        console.error('Dashboard stats error:', response.status);
      }
    } catch (error) {
      console.error('Dashboard stats fetch error:', error);
    }
  };

  if (!isReady) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">Randevu Sistemi</h1>
            </div>
            
            {/* Navigation Menu */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/dashboard" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">
                Dashboard
              </Link>
              <Link href="/appointments" className="text-gray-600 hover:text-gray-900 transition-colors">
                Randevularım
              </Link>
              <Link href="/calendar" className="text-gray-600 hover:text-gray-900 transition-colors">
                Takvim
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {userType === 'consultant' ? 'Danışman Dashboard' : 'Müşteri Dashboard'}
          </h1>
          <p className="text-gray-600 mt-2">
            {userType === 'consultant' 
              ? 'Randevu taleplerinizi ve müşterilerinizi yönetin' 
              : 'Randevularınızı ve danışmanlarınızı görüntüleyin'
            }
          </p>
        </div>

        {/* Hata Mesajı */}
        {message && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 border border-red-200 rounded-md">
            {message}
          </div>
        )}

        {/* Bildirim Durumu */}
        {isInitialized && (
          <div className="mb-8">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              user?.isSubscribed 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {user?.isSubscribed ? (
                <Bell className="w-4 h-4 mr-2" />
              ) : (
                <BellOff className="w-4 h-4 mr-2" />
              )}
              {user?.isSubscribed ? 'Bildirimler Aktif' : 'Bildirimler Kapalı'}
            </div>
          </div>
        )}

        {/* User Type'a Göre Dashboard */}
        {userType === 'client' ? (
          // MÜŞTERİ DASHBOARD'ı
          <>
            {/* Yeni Randevu Oluştur Kartı */}
            <div className="mb-8">
              <Link href="/appointments/create" className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white hover:shadow-lg transition-shadow inline-block">
            <div className="flex items-center">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                    <h3 className="text-lg font-semibold mb-2">Yeni Randevu Oluştur</h3>
                    <p className="text-green-100 mb-4">Danışmanınızdan yeni randevu almak için tıklayın</p>
                    <div className="inline-flex items-center px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                      <Plus className="w-4 h-4 mr-2" />
                      Randevu Oluştur
                    </div>
              </div>
            </div>
          </Link>
            </div>

            {/* Müşteri İstatistikleri */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Randevu</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardStats?.totalAppointments || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Onaylandı</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardStats?.confirmedAppointments || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bekleyen</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardStats?.pendingAppointments || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardStats?.completedAppointments || 0}</p>
              </div>
            </div>
          </div>
        </div>

            {/* Müşteri Son Randevular */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Son Randevularım</h2>
            <Link
              href="/appointments"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Tümünü Gör →
            </Link>
          </div>
          <div className="space-y-4">
                {dashboardStats?.recentAppointments && dashboardStats.recentAppointments.length > 0 ? (
                  dashboardStats.recentAppointments.map((appointment: any) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{appointment.consultant_name}</h3>
                            <p className="text-sm text-gray-600">{appointment.consultant_email}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(appointment.start_time).toLocaleDateString('tr-TR')} - {new Date(appointment.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        {appointment.notes && (
                          <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status === 'pending' ? 'Beklemede' :
                           appointment.status === 'confirmed' ? 'Onaylandı' :
                           appointment.status === 'completed' ? 'Tamamlandı' :
                           appointment.status === 'cancelled' ? 'İptal Edildi' :
                           appointment.status}
                        </span>
                        <Link
                          href={`/appointments/${appointment.id}`}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Detay
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                      <h3 className="font-medium text-gray-900">Henüz randevunuz yok</h3>
                      <p className="text-sm text-gray-600">İlk randevunuzu oluşturmak için yukarıdaki butona tıklayın</p>
                    </div>
                    <Link
                      href="/appointments"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Randevularım
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : userType === 'consultant' ? (
          // DANIŞMAN DASHBOARD'ı
          <>
            {/* Danışman Hızlı Erişim */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Link href="/appointments" className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold mb-2">Randevu Talepleri</h3>
                    <p className="text-blue-100 mb-4">Gelen randevu taleplerini görüntüleyin</p>
                    <div className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      <Calendar className="w-4 h-4 mr-2" />
                      Randevuları Gör
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/profile" className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold mb-2">Profil Ayarları</h3>
                    <p className="text-purple-100 mb-4">Çalışma saatlerinizi ve hizmetlerinizi düzenleyin</p>
                    <div className="inline-flex items-center px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                      <Users className="w-4 h-4 mr-2" />
                      Profili Düzenle
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Danışman İstatistikleri */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Toplam Randevu</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardStats?.totalAppointments || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Toplam Müşteri</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardStats?.totalClients || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Bekleyen</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardStats?.pendingAppointments || 0}</p>
                  </div>
            </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Kazanç</p>
                    <p className="text-2xl font-semibold text-gray-900">₺{dashboardStats?.totalEarnings || 0}</p>
                  </div>
            </div>
          </div>
        </div>

            {/* Danışman Son Randevular */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Son Randevu Talepleri</h2>
            <Link
                  href="/appointments"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
                  Tümünü Gör →
            </Link>
          </div>
              <div className="space-y-4">
                {dashboardStats?.recentAppointments && dashboardStats.recentAppointments.length > 0 ? (
                  dashboardStats.recentAppointments.map((appointment: any) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{appointment.client_name}</h3>
                            <p className="text-sm text-gray-600">{appointment.client_email}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(appointment.start_time).toLocaleDateString('tr-TR')} - {new Date(appointment.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        {appointment.notes && (
                          <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status === 'pending' ? 'Beklemede' :
                           appointment.status === 'confirmed' ? 'Onaylandı' :
                           appointment.status === 'completed' ? 'Tamamlandı' :
                           appointment.status === 'cancelled' ? 'İptal Edildi' :
                           appointment.status}
                        </span>
            <Link
                          href={`/appointments/${appointment.id}`}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
                          Detay
            </Link>
          </div>
        </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Henüz randevu talebi yok</h3>
                      <p className="text-sm text-gray-600">Müşterilerden randevu talepleri geldiğinde burada görünecek</p>
                    </div>
                    <Link
                      href="/appointments"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Randevuları Gör
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          // Loading durumu
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Dashboard yükleniyor...</p>
          </div>
        )}
      </div>
    </div>
  );
}
