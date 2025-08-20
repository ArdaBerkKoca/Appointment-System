'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { validateRegisterForm, getFieldError, ValidationError, RegisterFormData } from '../../../utils/validation';

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    full_name: '',
    user_type: 'client',
    expertise: '',
    hourly_rate: ''
  } as any);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors([]);

    // Form validasyonu
    const errors = validateRegisterForm(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Store token
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        router.push('/dashboard');
      } else {
        setError(data.error || 'Kayıt olurken bir hata oluştu');
      }
    } catch (err) {
      setError('Sunucu bağlantısında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Hesap Oluştur
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <input
                name="full_name"
                type="text"
                required
                className={`appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  getFieldError(validationErrors, 'full_name') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ad Soyad"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
              {getFieldError(validationErrors, 'full_name') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError(validationErrors, 'full_name')}</p>
              )}
            </div>
            <div>
              <input
                name="email"
                type="email"
                required
                className={`appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  getFieldError(validationErrors, 'email') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="E-posta adresi"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              {getFieldError(validationErrors, 'email') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError(validationErrors, 'email')}</p>
              )}
            </div>
            <div>
              <input
                name="password"
                type="password"
                required
                className={`appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  getFieldError(validationErrors, 'password') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Şifre"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              {getFieldError(validationErrors, 'password') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError(validationErrors, 'password')}</p>
              )}
            </div>
            <div>
              <select
                name="user_type"
                className={`appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  getFieldError(validationErrors, 'user_type') ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.user_type}
                onChange={(e) => setFormData({...formData, user_type: e.target.value as 'client' | 'consultant'})}
              >
                <option value="client">Müşteri</option>
                <option value="consultant">Danışman</option>
              </select>
              {getFieldError(validationErrors, 'user_type') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError(validationErrors, 'user_type')}</p>
              )}
            </div>
            {formData.user_type === 'consultant' && (
              <>
                <div>
                  <input
                    name="expertise"
                    type="text"
                    required
                    className={`appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      getFieldError(validationErrors, 'expertise') ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Uzmanlık (ör. psikoloji, koçluk)"
                    value={(formData as any).expertise || ''}
                    onChange={(e) => setFormData({...formData, expertise: e.target.value} as any)}
                  />
                  {getFieldError(validationErrors, 'expertise') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError(validationErrors, 'expertise')}</p>
                  )}
                </div>
                <div>
                  <input
                    name="hourly_rate"
                    type="number"
                    min={1}
                    required
                    className={`appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      getFieldError(validationErrors, 'hourly_rate') ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Saatlik Ücret (₺)"
                    value={(formData as any).hourly_rate || ''}
                    onChange={(e) => setFormData({...formData, hourly_rate: e.target.value} as any)}
                  />
                  {getFieldError(validationErrors, 'hourly_rate') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError(validationErrors, 'hourly_rate')}</p>
                  )}
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500">
              Zaten hesabınız var mı? Giriş yapın
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
