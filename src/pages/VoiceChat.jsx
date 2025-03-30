// src/pages/VoiceChat.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Square, Send, Settings, Volume2, VolumeX } from 'lucide-react';
import { BackgroundEffects } from '../components/ui';
import voiceAssistantService from '../services/voiceAssistantService';

const VoiceChat = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your university advisor assistant. You can ask me questions about universities, admission chances, or anything related to your college journey.' }
  ]);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [speechRate, setSpeechRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [statusText, setStatusText] = useState('Initializing voice assistant...');
  const [isConnected, setIsConnected] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize the SpeechRecognition API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setTranscribedText(prevText => prevText + ' ' + finalTranscript);
        } else if (interimTranscript) {
          setStatusText(`Hearing: ${interimTranscript}`);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setStatusText(`Error: ${event.error}`);
      };

      recognitionRef.current.onend = () => {
        if (isRecording) {
          setIsRecording(false);
        }
      };
    } else {
      setStatusText("Speech recognition not supported in your browser.");
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error('Failed to abort recognition:', e);
        }
      }
    };
  }, [isRecording]);

  // Initialize voice assistant service
  useEffect(() => {
    async function initializeService() {
      try {
        await voiceAssistantService.initialize();
        setIsConnected(true);
        setStatusText("Ready to help with your university questions!");

        // Set up event handlers
        voiceAssistantService.on('processingStart', () => {
          setMessages(prev => [...prev, { role: 'thinking', content: 'Processing your question...' }]);
        });

        voiceAssistantService.on('llmResponse', (data) => {
          // Remove thinking message
          setMessages(prev => prev.filter(msg => msg.role !== 'thinking'));

          // Add response
          setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);

          // Speak response if not muted
          if (!isMuted) {
            speakText(data.text);
          }
        });

        voiceAssistantService.on('error', (data) => {
          setStatusText(`Error: ${data.message}`);
          setMessages(prev => prev.filter(msg => msg.role !== 'thinking'));
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `I encountered an error: ${data.message}. Please try again.`
          }]);
        });

        voiceAssistantService.on('disconnect', () => {
          setIsConnected(false);
          setStatusText("Disconnected from voice assistant server. Refresh to reconnect.");
        });
      } catch (error) {
        console.error('Failed to initialize voice assistant:', error);
        setStatusText("Failed to connect to voice assistant server.");
      }
    }

    initializeService();

    return () => {
      voiceAssistantService.disconnect();
    };
  }, [isMuted]);

  // Get available voices when component mounts
  useEffect(() => {
    const getVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        // Try to find and set a default English voice
        const defaultVoice = availableVoices.find(voice =>
          voice.lang.includes('en-') && (voice.name.includes('Female') || voice.name.includes('Google'))
        ) || availableVoices[0];
        setSelectedVoice(defaultVoice);
      }
    };

    // Chrome loads voices asynchronously
    if (window.speechSynthesis) {
      getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = getVoices;
      }
    }
  }, []);

  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Start/stop recording with speech recognition
  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      setTranscribedText('');
      setIsRecording(true);

      if (recognitionRef.current) {
        recognitionRef.current.start();
        setStatusText("Listening... Speak now.");
      }

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
        setStatusText("Recording saved. Send or record again.");
      };

      mediaRecorderRef.current.start();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setStatusText("Microphone access denied. Check permissions.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setStatusText("Processing recording...");

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Failed to stop recognition:', e);
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();

      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
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

  // Speak text using speech synthesis
  const speakText = (text) => {
    if (!window.speechSynthesis || isMuted) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = speechRate;
    utterance.pitch = pitch;

    window.speechSynthesis.speak(utterance);
  };

  // Send voice message
  const sendVoiceMessage = async () => {
    if (!transcribedText.trim() && !audioBlob) {
      setStatusText("No speech detected. Try recording again.");
      return;
    }

    const messageText = transcribedText.trim();

    // Add user message to chat
    setMessages(prev => [...prev, {
      role: 'user',
      content: messageText,
      isAudio: !!audioBlob,
      audioUrl: audioURL
    }]);

    // Send to voice assistant service if connected
    if (isConnected) {
      voiceAssistantService.sendSpeech(messageText);
      setStatusText("Message sent, awaiting response...");
    } else {
      // Fallback for demo mode when not connected
      setMessages(prev => [...prev, { role: 'thinking', content: 'Processing your question...' }]);

      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.role !== 'thinking'));

        const fallbackResponses = [
          "I understand you're asking about university admissions. For top universities like those in our explorer, you'll typically need a strong academic record with a high GPA and test scores, as well as extracurricular activities that demonstrate your interests and leadership.",
          "Based on what I understand about university selection, it's important to consider factors beyond rankings, such as location, campus culture, available majors, and financial considerations. Our university explorer can help you filter schools based on these criteria.",
          "Regarding application strategies, many students find that applying to a mix of reach, target, and safety schools provides the best outcomes. Our data shows that early decision applications can increase your chances at many institutions."
        ];

        const response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

        setMessages(prev => [...prev, { role: 'assistant', content: response }]);

        if (!isMuted) {
          speakText(response);
        }

        setStatusText("Ready for your next question.");
      }, 2000);
    }

    // Reset recording state
    setAudioBlob(null);
    setAudioURL('');
    setTranscribedText('');
  };

  const toggleMute = () => {
    if (!isMuted && window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white relative overflow-hidden">
      {/* Animated background */}
      <BackgroundEffects animateBackground={true} />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 flex justify-between items-center shadow-lg relative z-10 backdrop-blur-sm">
        <div className="absolute inset-0 bg-blue-500 opacity-5 animate-pulse"></div>
        <h1 className="text-xl md:text-2xl font-bold relative">
          University Voice Assistant
          <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-blue-400 rounded-full"></span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full hover:bg-blue-800 transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full hover:bg-blue-800 transition-colors"
            title="Voice Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="bg-gray-800 border-b border-gray-700 p-3 relative z-10">
          <h3 className="font-medium mb-2 text-blue-300">Voice Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Assistant Voice</label>
              <select
                className="bg-gray-700 border border-gray-600 rounded p-2 text-sm"
                value={selectedVoice ? voices.indexOf(selectedVoice) : 0}
                onChange={(e) => setSelectedVoice(voices[e.target.value])}
              >
                {voices.map((voice, index) => (
                  <option key={`${voice.name}-${index}`} value={index}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Speaking Rate: {speechRate.toFixed(1)}</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="accent-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Pitch: {pitch.toFixed(1)}</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="accent-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 relative z-10" ref={chatContainerRef}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'thinking' ? (
                <div className="bg-gray-800 bg-opacity-70 text-gray-300 rounded-lg p-3 flex items-center gap-2 animate-pulse">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                  <span className="ml-1">{message.content}</span>
                </div>
              ) : (
                <div
                  className={`rounded-lg p-3 max-w-md shadow transform transition-all duration-300 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-800 text-gray-200 rounded-bl-none'
                  }`}
                >
                  {message.isAudio ? (
                    <div className="flex flex-col gap-2">
                      <span className="text-sm text-blue-200">Audio message:</span>
                      <p>{message.content}</p>
                      <audio src={message.audioUrl} controls className="h-8 w-40" />
                    </div>
                  ) : (
                    <p className="leading-relaxed">{message.content}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Voice controls */}
      <div className="backdrop-blur-sm bg-gray-800/70 border-t border-gray-700 p-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col gap-3">
            {transcribedText && (
              <div className="bg-gray-700 p-2 rounded text-sm">
                <span className="text-gray-400">Transcribed: </span>
                <span>{transcribedText}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex space-x-4 items-center">
                <button
                  onClick={toggleRecording}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isRecording
                      ? 'bg-red-600 animate-pulse scale-110'
                      : 'bg-blue-600 hover:bg-blue-500 hover:scale-105'
                  } shadow-lg shadow-blue-900/30`}
                  disabled={!isConnected && !transcribedText}
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
                      {isPlaying ? "Playing recording..." : "Review recording"}
                    </div>
                  </div>
                )}
              </div>

              {(audioBlob || transcribedText) && (
                <button
                  onClick={sendVoiceMessage}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded flex items-center gap-2 transition-colors shadow-md hover:shadow-lg"
                >
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </button>
              )}
            </div>

            <div className="text-xs text-gray-400 text-center">
              {statusText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceChat;