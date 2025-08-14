'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Appointment {
  id: number;
  consultant_id: number;
  client_id: number;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  consultant?: {
    full_name: string;
    email: string;
  };
  client?: {
    full_name: string;
    email: string;
  };
}

export default function AppointmentDetailPage() {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [userType, setUserType] = useState<'consultant' | 'client' | null>(null);
  const router = useRouter();
  const params = useParams();
  const appointmentId = params?.id;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchUserType();
    fetchAppointment();
  }, [appointmentId, router]);

  const fetchUserType = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUserType(userData.data.user_type);
      }
    } catch (error) {
      console.error('Kullanıcı tipi alınırken hata:', error);
    }
  };

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/appointments/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Randevu bulunamadı');
        } else {
          throw new Error('Randevu yüklenemedi');
        }
        return;
      }

      const data = await response.json();
      setAppointment(data.data);
    } catch (err) {
      setError('Randevu yüklenirken hata oluştu');
      console.error('Error fetching appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Bu randevuyu iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setCancelling(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Randevu iptal edilemedi');
      }

      // Randevu durumunu güncelle
      if (appointment) {
        setAppointment({ ...appointment, status: 'cancelled' });
      }
    } catch (err) {
      setError('Randevu iptal edilirken hata oluştu');
    } finally {
      setCancelling(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirm('Bu randevuyu onaylamak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setConfirming(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/appointments/${appointmentId}/confirm`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Randevu onaylanamadı');
      }

      // Randevu durumunu güncelle
      if (appointment) {
        setAppointment({ ...appointment, status: 'confirmed' });
      }
    } catch (err) {
      setError('Randevu onaylanırken hata oluştu');
    } finally {
      setConfirming(false);
    }
  };

  const handleComplete = async () => {
    if (!confirm('Bu randevuyu tamamlamak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setCompleting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/appointments/${appointmentId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Randevu tamamlanamadı');
      }

      // Randevu durumunu güncelle
      if (appointment) {
        setAppointment({ ...appointment, status: 'completed' });
      }
    } catch (err) {
      setError('Randevu tamamlanırken hata oluştu');
    } finally {
      setCompleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Onaylandı';
      case 'pending': return 'Beklemede';
      case 'cancelled': return 'İptal Edildi';
      case 'completed': return 'Tamamlandı';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Randevu yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error || 'Randevu bulunamadı'}
          </div>
          <Link href="/appointments" className="text-indigo-600 hover:text-indigo-900">
            ← Randevulara Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Navigation */}
        <div className="mb-6 flex items-center space-x-4">
          <Link href="/appointments" className="text-indigo-600 hover:text-indigo-900 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Randevulara Dön
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-900">
            Dashboard
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/" className="text-indigo-600 hover:text-indigo-900">
            Ana Sayfa
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Randevu Detayı</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                {getStatusText(appointment.status)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tarih ve Saat */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tarih ve Saat</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Tarih</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(appointment.start_time).toLocaleDateString('tr-TR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Başlangıç Saati</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(appointment.start_time).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Bitiş Saati</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(appointment.end_time).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Katılımcılar */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Katılımcılar</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Danışman</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {appointment.consultant?.full_name || 'Bilinmiyor'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Müşteri</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {appointment.client?.full_name || 'Bilinmiyor'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notlar */}
            {appointment.notes && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notlar</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{appointment.notes}</p>
                </div>
              </div>
            )}

            {/* İşlemler */}
            <div className="mt-8 flex justify-end space-x-3">
              {appointment.status === 'pending' && (
                <>
                  {userType === 'consultant' && (
                    <button
                      onClick={handleConfirm}
                      disabled={confirming}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {confirming ? 'Onaylanıyor...' : 'Onayla'}
                    </button>
                  )}
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelling ? 'İptal Ediliyor...' : 'Randevuyu İptal Et'}
                  </button>
                </>
              )}
              {appointment.status === 'confirmed' && userType === 'consultant' && (
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {completing ? 'Tamamlanıyor...' : 'Tamamla'}
                </button>
              )}
              <Link
                href="/appointments"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Geri Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
