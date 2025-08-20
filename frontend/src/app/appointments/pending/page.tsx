'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AppointmentItem {
  id: number;
  start_time: string;
  end_time: string;
  notes?: string;
  client?: { full_name: string; email: string };
  consultant?: { full_name: string; email: string };
}

export default function PendingRequestsPage() {
  const [items, setItems] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/appointments/pending/requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Bekleyen talepler alınamadı');
      const data = await res.json();
      setItems(data.data || []);
    } catch (e: any) {
      setError(e.message || 'Bekleyen talepler alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const act = async (id: number, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/appointments/${id}/${action}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('İşlem başarısız');
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (e: any) {
      alert(e.message || 'İşlem başarısız');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Bekleyen Randevu Talepleri</h1>
          <Link href="/appointments" className="text-indigo-600 hover:text-indigo-900">Randevular</Link>
        </div>

        {loading ? (
          <div className="text-gray-600">Yükleniyor...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500">Bekleyen talep yok.</div>
        ) : (
          <ul className="space-y-3">
            {items.map(item => (
              <li key={item.id} className="p-4 rounded border bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">{item.client?.full_name || 'Müşteri'}</div>
                    <div className="text-gray-700 text-sm mt-1">
                      {new Date(item.start_time).toLocaleDateString('tr-TR')} {new Date(item.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {new Date(item.end_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {item.notes && <div className="text-xs text-gray-500 mt-1">{item.notes}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => act(item.id, 'approve')} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">Onayla</button>
                    <button onClick={() => act(item.id, 'reject')} className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">Reddet</button>
                    <Link href={`/appointments/${item.id}`} className="px-3 py-1 border text-sm rounded">Detay</Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


