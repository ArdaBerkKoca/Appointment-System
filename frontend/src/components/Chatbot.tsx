'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { chatbot, ChatMessage } from '../utils/chatbot';

// ChatMessage interface'ini genişlet
interface ExtendedChatMessage extends ChatMessage {
  context?: string;
  suggestions?: string[];
  language?: 'tr' | 'en';
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 500, height: 600 });
  const MIN_WIDTH = 400;
  const MIN_HEIGHT = 400;
  const MAX_WIDTH = 800;
  const MAX_HEIGHT = 800;
  const [isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Context'e göre ek öneriler getir (dil desteği ile)
  const getContextBasedSuggestions = (context: string, language: 'tr' | 'en'): string[] => {
    const isEnglish = language === 'en';
    
    switch (context) {
      case 'randevu':
      case 'randevu_oluşturma':
        return isEnglish 
          ? ['Go to Dashboard', 'Find consultant', 'Select date', 'Price info']
          : ['Dashboard\'a git', 'Danışman bul', 'Tarih seç', 'Ücret bilgisi'];
      case 'randevu_onaylama':
        return isEnglish
          ? ['Make payment', 'Email confirmation', 'Add to calendar', 'Get reminder']
          : ['Ödeme yap', 'E-posta onayı', 'Takvime ekle', 'Hatırlatma al'];
      case 'tarih_saat_seçimi':
        return isEnglish
          ? ['This week', 'Next week', 'Custom date', 'Available hours']
          : ['Bu hafta', 'Gelecek hafta', 'Özel tarih', 'Müsait saatler'];
      case 'danışman_seçimi':
      case 'danışman_seçimi_detay':
        return isEnglish
          ? ['Search expertise', 'Filter experience', 'Compare prices', 'Check availability']
          : ['Uzmanlık ara', 'Deneyim filtrele', 'Ücret karşılaştır', 'Müsaitlik kontrol'];
      case 'bildirim':
      case 'bildirim_açma':
        return isEnglish
          ? ['Email settings', 'Push notifications', 'SMS notifications', 'Notification types']
          : ['E-posta ayarları', 'Push bildirimleri', 'SMS bildirimleri', 'Bildirim türleri'];
      case 'profil':
        return isEnglish
          ? ['Personal info', 'Contact info', 'Address info', 'Account settings']
          : ['Kişisel bilgiler', 'İletişim bilgileri', 'Adres bilgileri', 'Hesap ayarları'];
      case 'şifre':
        return isEnglish
          ? ['Security settings', 'Two-factor auth', 'Password policy', 'Account lock']
          : ['Güvenlik ayarları', 'İki faktörlü doğrulama', 'Şifre politikası', 'Hesap kilitleme'];
      default:
        return isEnglish
          ? ['Create appointment', 'Get help', 'Edit profile', 'Notification settings']
          : ['Randevu oluştur', 'Yardım al', 'Profil düzenle', 'Bildirim ayarları'];
    }
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // İlk açılışta karşılama mesajı
      const welcomeMessage = chatbot.getWelcomeMessage();
      const newMessage: ExtendedChatMessage = {
        id: Date.now().toString(),
        text: welcomeMessage.text,
        isUser: false,
        timestamp: new Date(),
        context: welcomeMessage.context,
        suggestions: welcomeMessage.suggestions,
        language: welcomeMessage.language
      };
      setMessages([newMessage]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    // Mesajlar değiştiğinde en alta scroll
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Chatbot açıldığında input'a focus
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Chatbot yanıtını simüle et (gerçek API çağrısı yerine)
    setTimeout(() => {
      const response = chatbot.getResponse(userMessage.text);
      const botMessage: ExtendedChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isUser: false,
        timestamp: new Date(),
        context: response.context,
        suggestions: response.suggestions,
        language: response.language
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  // Resize işlemleri
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !chatWindowRef.current) return;

    const rect = chatWindowRef.current.getBoundingClientRect();
    const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, e.clientX - rect.left));
    const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, window.innerHeight - e.clientY - 100));

    setWindowSize({ width: newWidth, height: newHeight });
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={toggleChatbot}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center"
        aria-label="Chatbot'u aç/kapat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chatbot Panel */}
      {isOpen && (
        <div 
          ref={chatWindowRef}
          className="fixed bottom-24 right-6 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden"
          style={{ 
            width: `${windowSize.width}px`, 
            height: `${windowSize.height}px`,
            cursor: isResizing ? 'nw-resize' : 'default'
          }}
        >
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">AI Asistan</h3>
                <p className="text-sm text-blue-100">
                  {messages.length > 0 && messages[messages.length - 1].language === 'en' ? "How can I help you?" : "Size nasıl yardımcı olabilirim?"}
                </p>
              </div>
            </div>
            <button
              onClick={toggleChatbot}
              className="text-white hover:text-blue-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {!message.isUser && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="whitespace-pre-line">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.isUser ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString('tr-TR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    {message.isUser && (
                      <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-1">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={messages.length > 0 && messages[messages.length - 1].language === 'en' ? "Type your message..." : "Mesajınızı yazın..."}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Suggestions */}
            {messages.length > 0 && !isTyping && (
              <div className="mt-3 flex flex-wrap gap-2">
                {messages.length > 0 && messages[messages.length - 1] && !messages[messages.length - 1].isUser && (
                  <>
                    {/* Context ve dil bilgisi (geliştirme için) */}
                    <div className="flex items-center gap-2 mb-2">
                      {messages[messages.length - 1].context && (
                        <span className="text-xs text-gray-500">
                          Bağlam: {messages[messages.length - 1].context}
                        </span>
                      )}
                      {messages[messages.length - 1].language && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          messages[messages.length - 1].language === 'en' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {messages[messages.length - 1].language === 'en' ? 'EN' : 'TR'}
                        </span>
                      )}
                    </div>
                    
                    {/* Dinamik Quick Suggestions */}
                    {messages[messages.length - 1].suggestions?.slice(0, 4).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full transition-colors border border-blue-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                    
                    {/* Context'e göre ek öneriler */}
                    {messages[messages.length - 1].context && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-500 block mb-1">
                          {messages[messages.length - 1].language === 'en' ? 'Related topics:' : 'İlgili konular:'}
                        </span>
                        {getContextBasedSuggestions(messages[messages.length - 1].context!, messages[messages.length - 1].language || 'tr').map((suggestion, index) => (
                          <button
                            key={`context-${index}`}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full transition-colors mr-1 mb-1"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Resize Handle */}
          <div 
            className="absolute bottom-0 right-0 w-6 h-6 cursor-nw-resize bg-gray-100 hover:bg-gray-200 transition-colors border-t border-l border-gray-300 rounded-tl"
            onMouseDown={handleMouseDown}
            title="Boyutu değiştirmek için sürükleyin"
          >
            <div className="w-full h-full flex items-end justify-start p-1">
              <div className="w-3 h-3 border-l-2 border-b-2 border-gray-400"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
