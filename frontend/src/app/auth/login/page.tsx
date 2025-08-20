'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { validateLoginForm, getFieldError, ValidationError, LoginFormData } from '../../../utils/validation';

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
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
    const errors = validateLoginForm(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/login`, {
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
        setError(data.error || 'Giriş yaparken bir hata oluştu');
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
            Hesabınıza Giriş Yapın
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
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/auth/register" className="text-indigo-600 hover:text-indigo-500">
              Hesabınız yok mu? Kayıt olun
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
