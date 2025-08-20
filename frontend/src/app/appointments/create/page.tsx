'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  full_name: string;
  user_type: 'consultant' | 'client';
}

export default function CreateAppointmentPage() {
  const [formData, setFormData] = useState({
    consultant_id: '',
    start_time: '',
    end_time: '',
    notes: ''
  });
  const [consultants, setConsultants] = useState<User[]>([]);
  const [filters, setFilters] = useState({ expertise: '', minPrice: '', maxPrice: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchConsultants();
  }, [router]);

  // Danışman ise randevu oluşturma sayfasına erişimi engelle
  useEffect(() => {
    const checkUserType = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.data.user_type === 'consultant') {
            router.push('/dashboard');
          }
        }
      } catch (error) {
        console.error('Kullanıcı tipi kontrol edilirken hata:', error);
      }
    };

    checkUserType();
  }, [router]);

  const fetchConsultants = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.expertise) params.append('expertise', filters.expertise);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/consultants?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConsultants(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching consultants:', err);
    }
  };

  const applyFilters = () => {
    fetchConsultants();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/appointments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          consultant_id: parseInt(formData.consultant_id),
          start_time: formData.start_time,
          end_time: formData.end_time,
          notes: formData.notes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Randevu oluşturulamadı');
      }

      const created = await response.json();
      // Randevu oluşturulunca direkt detay + ödeme sayfasına yönlendir
      if (created?.data?.id) {
        router.push(`/appointments/${created.data.id}`);
      } else {
        router.push('/appointments');
      }
    } catch (err: any) {
      setError(err.message || 'Randevu oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
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

          {/* Header */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Yeni Randevu Oluştur</h1>
                <p className="text-gray-600">Danışmanınızdan randevu alın</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Filtreler */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Uzmanlık (virgülle ayırın)</label>
                <input
                  type="text"
                  value={filters.expertise}
                  onChange={(e) => setFilters(prev => ({ ...prev, expertise: e.target.value }))}
                  placeholder="psikoloji, koçluk, beslenme"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Fiyat</label>
                <input
                  type="number"
                  min={0}
                  value={filters.minPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Fiyat</label>
                <input
                  type="number"
                  min={0}
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button
                  type="button"
                  onClick={applyFilters}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Filtreleri Uygula
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="consultant_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Danışman Seçin
                </label>
                <select
                  id="consultant_id"
                  name="consultant_id"
                  value={formData.consultant_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Danışman seçin...</option>
                  {consultants.map((consultant: any) => (
                    <option key={consultant.id} value={consultant.id}>
                      {consultant.full_name}{consultant.hourly_rate ? ` - ₺${consultant.hourly_rate}` : ''}{consultant.expertise ? ` (${consultant.expertise})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">
                    Başlangıç Zamanı
                  </label>
                  <input
                    type="datetime-local"
                    id="start_time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">
                    Bitiş Zamanı
                  </label>
                  <input
                    type="datetime-local"
                    id="end_time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notlar (Zorunlu)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Randevu hakkında notlarınızı buraya yazabilirsiniz..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Link
                  href="/appointments"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  İptal
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Oluşturuluyor...' : 'Randevu Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
