'use client';

import React, { useState } from 'react';

interface OneSignalEmailSettingsProps {
  onClose: () => void;
}

export default function OneSignalEmailSettings({ onClose }: OneSignalEmailSettingsProps) {
  const [email, setEmail] = useState('');
  const [templateType, setTemplateType] = useState('confirmation');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const templateTypes = [
    { value: 'reminder', label: '🔔 Randevu Hatırlatması' },
    { value: 'confirmation', label: '✅ Randevu Onayı' },
    { value: 'update', label: '📅 Randevu Güncelleme' },
    { value: 'cancellation', label: '❌ Randevu İptali' },
    { value: 'ai-recommendation', label: '💡 AI Önerisi' }
  ];

  const handleTestEmail = async () => {
    if (!email) {
      alert('Lütfen e-posta adresi girin');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3001/api/test/send-onesignal-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          templateType: templateType
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'E-posta gönderme hatası',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            📧 OneSignal E-posta Testi
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-posta Adresi
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-posta Şablonu
            </label>
            <select
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {templateTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleTestEmail}
            disabled={isLoading || !email}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '📤 Gönderiliyor...' : '📤 Test E-postası Gönder'}
          </button>

          {result && (
            <div className={`p-4 rounded-md ${
              result.success 
                ? 'bg-green-100 border border-green-300 text-green-800' 
                : 'bg-red-100 border border-red-300 text-red-800'
            }`}>
              <h4 className="font-semibold mb-2">
                {result.success ? '✅ Başarılı!' : '❌ Hata!'}
              </h4>
              <p className="text-sm">{result.message || result.error}</p>
              {result.details && (
                <p className="text-xs mt-2 opacity-75">{result.details}</p>
              )}
              {result.result && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium">
                    Teknik Detaylar
                  </summary>
                  <pre className="text-xs mt-2 bg-white bg-opacity-50 p-2 rounded overflow-auto">
                    {JSON.stringify(result.result, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Bilgi</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• OneSignal e-posta entegrasyonu test edilir</li>
            <li>• Gerçek e-posta adresinizi kullanın</li>
            <li>• Spam klasörünü kontrol edin</li>
            <li>• Template ID'leri OneSignal'da oluşturulmalı</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
