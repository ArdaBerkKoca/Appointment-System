'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
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
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchAppointments();
  }, [router]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Randevular yüklenemedi');
      const data = await response.json();
      setAppointments(data.data || []);
    } catch (err) {
      setError('Randevular yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Takvimde işaretlenecek günler
  const appointmentDates = appointments.map(a => new Date(a.start_time).toDateString());

  // Seçili günün randevuları
  const selectedAppointments = selectedDate
    ? appointments.filter(a => new Date(a.start_time).toDateString() === selectedDate.toDateString())
    : [];

  // Takvim hücresini işaretle
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && appointmentDates.includes(date.toDateString())) {
      return 'bg-indigo-200 rounded-full text-indigo-900 font-bold';
    }
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Randevular yükleniyor...</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
              <Link href="/calendar" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">
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

      <div className="max-w-3xl mx-auto py-8 px-4">
        {/* Navigation */}
        <div className="mb-6 flex items-center space-x-4">
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-900 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard'a Dön
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/appointments" className="text-indigo-600 hover:text-indigo-900">
            Randevularım
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/" className="text-indigo-600 hover:text-indigo-900">
            Ana Sayfa
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-gray-900">Takvim</h1>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        <div className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row gap-8">
          <div>
            <Calendar
              onChange={date => setSelectedDate(date as Date)}
              value={selectedDate}
              tileClassName={tileClassName}
              locale="tr-TR"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-4">{selectedDate ? `${selectedDate.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` : 'Bir gün seçin'}</h2>
            {selectedAppointments.length === 0 ? (
              <p className="text-gray-500">Bu gün için randevu yok.</p>
            ) : (
              <ul className="space-y-4">
                {selectedAppointments.map(a => (
                  <li key={a.id} className="bg-indigo-50 p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-indigo-900">
                          {new Date(a.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          {' - '}
                          {new Date(a.end_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-gray-700 text-sm mt-1">{a.notes}</div>
                      </div>
                      <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-indigo-200 text-indigo-900">
                        {a.status === 'confirmed' ? 'Onaylandı' : a.status === 'pending' ? 'Beklemede' : a.status === 'cancelled' ? 'İptal' : 'Tamamlandı'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
