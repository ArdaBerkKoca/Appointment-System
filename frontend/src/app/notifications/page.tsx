'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'appointment' | 'system' | 'reminder';
  is_read: boolean;
  created_at: string;
  appointment_id?: number;
  action_required?: boolean;
  action_type?: 'approve' | 'reject' | 'reschedule';
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchNotifications();
  }, [router]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/notifications?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Bildirimler alınamadı');
      const data = await res.json();
      setItems(data.data || []);
    } catch (e: any) {
      setError(e.message || 'Bildirimler alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setItems(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Bildirimler</h1>
          <button onClick={markAllRead} className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Hepsini okundu işaretle</button>
        </div>

        <div className="mb-4">
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-900">← Dashboard</Link>
        </div>

        {loading ? (
          <div className="text-gray-600">Yükleniyor...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500">Bildirim bulunmuyor.</div>
        ) : (
          <ul className="space-y-3">
            {items.map(item => (
              <li key={item.id} className={`p-4 rounded border ${item.is_read ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-gray-700 text-sm mt-1">{item.message}</div>
                    <div className="text-xs text-gray-400 mt-2">{new Date(item.created_at).toLocaleString('tr-TR')}</div>
                  </div>
                  {item.appointment_id && (
                    <Link href={`/appointments/${item.appointment_id}`} className="text-indigo-600 hover:text-indigo-800 text-sm">Detay</Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


