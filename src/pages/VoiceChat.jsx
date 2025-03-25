// src/pages/VoiceChat.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Square, Send } from 'lucide-react';

const VoiceChat = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your university advisor assistant. You can ask me questions about universities, admission chances, or anything related to your college journey.' }
  ]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);

  // Start/stop recording
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioBlob(audioBlob);
          setAudioURL(audioUrl);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        setMessages(prev => [...prev, {
          role: 'system',
          content: "Microphone access was denied. Please check your browser permissions."
        }]);
      }
    }
  };

  // Play/pause recorded audio
  const togglePlayback = () => {
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle audio playback end
  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.onended = () => {
        setIsPlaying(false);
      };
    }
  }, [audioURL]);

  // Send voice message
  const sendVoiceMessage = async () => {
    if (!audioBlob) return;

    // Add user message to chat
    setMessages(prev => [...prev, {
      role: 'user',
      content: 'Voice message',
      isAudio: true,
      audioUrl: audioURL
    }]);

    // In a real implementation, we would send the audio to an API
    // For demo purposes, we'll simulate a response after a delay
    setTimeout(() => {
      const responses = [
        "I've analyzed your question about admission requirements. For most top universities, you'll need a strong GPA, competitive test scores, and well-rounded extracurricular activities.",
        "Based on your voice message, I understand you're asking about scholarship opportunities. Many universities offer merit-based and need-based scholarships. I'd recommend exploring the financial aid sections on university websites.",
        "I heard your question about campus life. University environments vary widely - from urban campuses integrated with cities to more traditional enclosed campuses. Consider what environment would best suit your learning style and preferences.",
        "Regarding your question about application deadlines, most universities have early decision deadlines in November and regular decision deadlines in January. Be sure to check specific dates for each school you're interested in."
      ];

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)]
      }]);
    }, 1500);

    // Clear the recorded audio
    setAudioBlob(null);
    setAudioURL('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white relative overflow-hidden">
      {/* Background effects - matching main app style */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900 to-purple-900"></div>
        <div className="animate-pulse absolute -top-10 -left-10 w-32 h-32 rounded-full bg-blue-500 blur-xl"></div>
        <div className="animate-pulse absolute top-1/3 -right-10 w-40 h-40 rounded-full bg-purple-600 blur-xl"></div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 flex items-center shadow-lg relative z-10">
        <div className="absolute inset-0 bg-blue-500 opacity-5 animate-pulse"></div>
        <h1 className="text-xl md:text-2xl font-bold relative">
          Voice Assistant
          <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-blue-400 rounded-full"></span>
        </h1>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 relative z-10">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-lg p-3 max-w-md ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-200'
                }`}
              >
                {message.isAudio ? (
                  <div className="flex items-center">
                    <span className="mr-2">Audio message</span>
                    <audio src={message.audioUrl} controls className="h-8 w-32" />
                  </div>
                ) : (
                  <p>{message.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice controls */}
      <div className="backdrop-blur-sm bg-gray-800/70 border-t border-gray-700 p-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4 items-center">
              <button
                onClick={toggleRecording}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording
                    ? 'bg-red-600 animate-pulse'
                    : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </button>

              {audioURL && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={togglePlayback}
                    className="w-8 h-8 rounded-full bg-blue-900 hover:bg-blue-800 flex items-center justify-center transition-colors"
                  >
                    {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <audio ref={audioPlayerRef} src={audioURL} className="hidden" />
                  <div className="text-sm text-gray-400">
                    {isPlaying ? "Playing..." : "Ready to play"}
                  </div>
                </div>
              )}
            </div>

            {audioBlob && (
              <button
                onClick={sendVoiceMessage}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded flex items-center transition-colors"
              >
                <Send className="h-4 w-4 mr-2" />
                <span>Send</span>
              </button>
            )}
          </div>

          <div className="mt-2 text-xs text-gray-400 text-center">
            {isRecording
              ? "Recording... Click the microphone to stop."
              : "Click the microphone to start recording your voice message."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceChat;