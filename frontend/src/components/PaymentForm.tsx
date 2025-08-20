'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface PaymentFormProps {
  appointmentId: number;
  amount: number;
  currency?: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
}

export default function PaymentForm({ 
  appointmentId, 
  amount, 
  currency = 'TRY',
  onSuccess,
  onError 
}: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePayment = async () => {
    setIsLoading(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Giriş yapmanız gerekiyor');
      }

      // Ödeme intent oluştur
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId,
          amount,
          currency
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ödeme başlatılamadı');
      }

      const data = await response.json();
      
      if (data.success) {
        // Gerçek uygulamada Stripe Elements kullanılacak
        // Şimdilik simüle ediyoruz
        await simulatePayment(data.data.clientSecret);

        // Backend'e ödeme onayı gönder (randevu durumunu güncellemek için)
        const confirmRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/payments/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            paymentIntentId: data.data.paymentIntentId,
            appointmentId
          })
        });

        if (!confirmRes.ok) {
          const err = await confirmRes.json().catch(() => ({}));
          throw new Error(err.message || 'Ödeme onayı başarısız');
        }

        setPaymentStatus('success');
        onSuccess({
          paymentIntentId: data.data.paymentIntentId,
          amount: data.data.amount,
          currency: data.data.currency
        });
      } else {
        throw new Error(data.message || 'Ödeme başlatılamadı');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      setErrorMessage(error.message || 'Ödeme işlemi başarısız');
      onError(error.message || 'Ödeme işlemi başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  // Ödeme simülasyonu (gerçek uygulamada Stripe Elements kullanılacak)
  const simulatePayment = async (clientSecret: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 2000);
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  if (paymentStatus === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-800 mb-2">
          Ödeme Başarılı!
        </h3>
        <p className="text-green-600 mb-4">
          Randevunuz onaylandı ve ödeme alındı.
        </p>
        <div className="text-sm text-green-700">
          <p>Tutar: {formatAmount(amount)}</p>
          <p>Randevu ID: #{appointmentId}</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-800 mb-2">
          Ödeme Başarısız
        </h3>
        <p className="text-red-600 mb-4">
          {errorMessage}
        </p>
        <button
          onClick={() => {
            setPaymentStatus('idle');
            setErrorMessage('');
          }}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Güvenli Ödeme
        </h3>
        <p className="text-gray-600">
          Randevunuzu onaylamak için ödeme yapın
        </p>
      </div>

      {/* Ödeme Detayları */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Randevu ID:</span>
          <span className="font-semibold">#{appointmentId}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Tutar:</span>
          <span className="text-xl font-bold text-blue-600">
            {formatAmount(amount)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Para Birimi:</span>
          <span className="font-semibold">{currency.toUpperCase()}</span>
        </div>
      </div>

      {/* Güvenlik Bilgisi */}
      <div className="flex items-center justify-center text-sm text-gray-500 mb-6">
        <Lock className="w-4 h-4 mr-2" />
        SSL ile korunan güvenli ödeme
      </div>

      {/* Ödeme Butonu */}
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            İşleniyor...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            {formatAmount(amount)} Öde
          </>
        )}
      </button>

      {/* Bilgilendirme */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Ödeme işlemi Stripe güvenlik sistemi ile korunmaktadır</p>
        <p>Kredi kartı bilgileriniz saklanmaz</p>
      </div>
    </div>
  );
}
