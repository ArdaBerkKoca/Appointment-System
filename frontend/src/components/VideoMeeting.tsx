'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Settings, Users, Chat } from 'lucide-react';

interface VideoMeetingProps {
  roomName: string;
  userName: string;
  onLeave: () => void;
}

export default function VideoMeeting({ roomName, userName, onLeave }: VideoMeetingProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<string[]>([userName]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Jitsi Meet API'sini yükle
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = initializeJitsi;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeJitsi = () => {
    // Jitsi Meet API'si yüklendikten sonra
    if (window.JitsiMeetExternalAPI) {
      const domain = 'meet.jit.si';
      const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: containerRef.current,
        userInfo: {
          displayName: userName
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
            'tileview', 'select-background', 'download', 'help', 'mute-everyone', 'security'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_POWERED_BY: false
        }
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);

      // Event listeners
      api.addEventListeners({
        videoConferenceJoined: () => {
          console.log('Video konferansa katıldı');
        },
        participantJoined: (id: string, participant: any) => {
          setParticipants(prev => [...prev, participant.displayName || 'Anonim']);
        },
        participantLeft: (id: string, participant: any) => {
          setParticipants(prev => prev.filter(p => p !== (participant.displayName || 'Anonim')));
        },
        videoConferenceLeft: () => {
          onLeave();
        }
      });
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // Jitsi API ile video toggle
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    setIsMuted(!isMuted);
    // Jitsi API ile audio toggle
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">Video Görüşme</h2>
          <span className="text-sm text-gray-300">Oda: {roomName}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className={`p-2 rounded-lg ${showParticipants ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            <Users className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-2 rounded-lg ${showChat ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            <Chat className="w-5 h-5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative" ref={containerRef}>
          {/* Jitsi Meet iframe buraya yüklenecek */}
        </div>

        {/* Sidebar */}
        {(showParticipants || showChat) && (
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            {showParticipants && (
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Katılımcılar</h3>
                <div className="space-y-2">
                  {participants.map((participant, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-gray-700 rounded-lg">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {participant.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-white">{participant}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showChat && (
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Sohbet</h3>
                <div className="bg-gray-700 rounded-lg p-3 mb-4 h-64 overflow-y-auto">
                  <p className="text-gray-300 text-sm">Sohbet özelliği yakında...</p>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Mesaj yazın..."
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Gönder
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex items-center justify-center space-x-4">
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full ${isAudioEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'}`}
        >
          {isAudioEnabled ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full ${isVideoEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'}`}
        >
          {isVideoEnabled ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
        </button>

        <button
          onClick={onLeave}
          className="p-4 rounded-full bg-red-600 hover:bg-red-500"
        >
          <PhoneOff className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}

// Jitsi Meet API types
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}
