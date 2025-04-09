// src/pages/UniversityVoiceChat.jsx - Fixed with useCallback for speakText
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Play, Square, Send, Settings, Volume2, VolumeX, Wand2 } from 'lucide-react';
import { BackgroundEffects } from '../components/ui';
import universityVoiceAssistantService from '../services/universityVoiceAssistantService';
import openAISpeechService from '../services/openAISpeechService';

const UniversityVoiceChat = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your university exploration assistant. Ask me about universities, admission requirements, or how to navigate the University Explorer application.' }
  ]);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [useOpenAI, setUseOpenAI] = useState(true);
  const [selectedOpenAIVoice, setSelectedOpenAIVoice] = useState('nova');
  const [browserVoices, setBrowserVoices] = useState([]);
  const [selectedBrowserVoice, setSelectedBrowserVoice] = useState(null);
  const [speechRate, setSpeechRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [statusText, setStatusText] = useState('Initializing university voice assistant...');
  const [isConnected, setIsConnected] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const currentAudioRef = useRef(null);

  // OpenAI Voice options
  const openAIVoices = [
    { id: 'alloy', name: 'Alloy (Neutral)' },
    { id: 'echo', name: 'Echo (Male)' },
    { id: 'fable', name: 'Fable (Male)' },
    { id: 'onyx', name: 'Onyx (Male)' },
    { id: 'nova', name: 'Nova (Female)' },
    { id: 'shimmer', name: 'Shimmer (Female)' }
  ];

  // Speak text using speech synthesis (browser API)
  const speakTextWithBrowser = useCallback((text) => {
    if (!window.speechSynthesis || isMuted) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    if (selectedBrowserVoice) {
      utterance.voice = selectedBrowserVoice;
    }

    utterance.rate = speechRate;
    utterance.pitch = pitch;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isMuted, selectedBrowserVoice, speechRate, pitch]);

  // Speak text using OpenAI TTS
  const speakTextWithOpenAI = useCallback(async (text) => {
    if (isMuted) return;

    try {
      setIsSpeaking(true);

      // Stop any currently playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      // Get audio blob from OpenAI
      const audioBlob = await openAISpeechService.textToSpeech(text, selectedOpenAIVoice);

      // Create audio URL and element
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      // Set up event handlers
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };

      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };

      // Play the audio
      currentAudioRef.current = audio;
      audio.play();
    } catch (error) {
      console.error('Error speaking with OpenAI:', error);
      setIsSpeaking(false);

      // Fall back to browser TTS if OpenAI fails
      speakTextWithBrowser(text);
    }
  }, [isMuted, selectedOpenAIVoice, speakTextWithBrowser]);

  // Unified speak function that chooses the appropriate method - wrapped in useCallback
  const speakText = useCallback((text) => {
    if (useOpenAI) {
      speakTextWithOpenAI(text);
    } else {
      speakTextWithBrowser(text);
    }
  }, [useOpenAI, speakTextWithOpenAI, speakTextWithBrowser]);

  // Initialize the SpeechRecognition API (Browser API)
  useEffect(() => {
    // Only set up browser speech recognition if not using OpenAI
    if (!useOpenAI) {
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
    }
  }, [isRecording, useOpenAI]);

  // Initialize voice assistant service
  useEffect(() => {
    async function initializeService() {
      try {
        await universityVoiceAssistantService.initialize();
        setIsConnected(true);
        setStatusText("Ready to help with your university questions!");

        // Set up event handlers
        universityVoiceAssistantService.on('processingStart', () => {
          setMessages(prev => [...prev, { role: 'thinking', content: 'Processing your question...' }]);
        });

        universityVoiceAssistantService.on('llmResponse', (data) => {
          // Remove thinking message
          setMessages(prev => prev.filter(msg => msg.role !== 'thinking'));

          // Add response
          setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);

          // Speak response if not muted
          if (!isMuted) {
            speakText(data.text);
          }
        });

        universityVoiceAssistantService.on('error', (data) => {
          setStatusText(`Error: ${data.message}`);
          setMessages(prev => prev.filter(msg => msg.role !== 'thinking'));
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `I encountered an error: ${data.message}. Please try again.`
          }]);
        });

        universityVoiceAssistantService.on('disconnect', () => {
          setIsConnected(false);
          setStatusText("Disconnected from university voice assistant server. Refresh to reconnect.");
        });
      } catch (error) {
        console.error('Failed to initialize university voice assistant:', error);
        setStatusText("Failed to connect to university voice assistant server.");
        setIsConnected(false);
      }
    }

    initializeService();

    return () => {
      universityVoiceAssistantService.disconnect();

      // Clean up any playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, [isMuted, speakText]);

  // Get available browser voices when component mounts
  useEffect(() => {
    const getVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setBrowserVoices(availableVoices);
        // Try to find and set a default English voice
        const defaultVoice = availableVoices.find(voice =>
          voice.lang.includes('en-') && (voice.name.includes('Female') || voice.name.includes('Google'))
        ) || availableVoices[0];
        setSelectedBrowserVoice(defaultVoice);
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

  // Start/stop recording
  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    if (!isConnected) {
      setStatusText("Cannot record: not connected to voice assistant server");
      return;
    }

    try {
      setTranscribedText('');
      setIsRecording(true);
      setStatusText("Listening... Speak now.");

      // Start browser speech recognition if not using OpenAI
      if (!useOpenAI && recognitionRef.current) {
        recognitionRef.current.start();
      }

      // Set up audio recording (needed for both browser and OpenAI)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Use specific options for better quality
      const options = {
        mimeType: 'audio/webm',
        audioBitsPerSecond: 128000
      };

      // Create MediaRecorder with best available options
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioURL(audioUrl);

        // If using OpenAI for transcription, process the audio
        if (useOpenAI) {
          try {
            setIsProcessingAudio(true);
            setStatusText("Processing audio with OpenAI...");
            const transcription = await openAISpeechService.transcribeAudio(audioBlob);
            setTranscribedText(transcription);
            setIsProcessingAudio(false);
            setStatusText("Audio processed. Send or record again.");
          } catch (error) {
            console.error("Error transcribing with OpenAI:", error);
            setIsProcessingAudio(false);
            setStatusText("Error processing audio. Try again.");
          }
        } else {
          setStatusText("Recording saved. Send or record again.");
        }
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

    // Stop browser speech recognition if not using OpenAI
    if (!useOpenAI && recognitionRef.current) {
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

  // Send voice message
  const sendVoiceMessage = async () => {
    if (!isConnected) {
      setStatusText("Cannot send message: not connected to voice assistant server");
      return;
    }

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

    // Send to voice assistant service
    universityVoiceAssistantService.sendSpeech(messageText);
    setStatusText("Message sent, awaiting response...");

    // Reset recording state
    setAudioBlob(null);
    setAudioURL('');
    setTranscribedText('');
  };

  // Toggle mute for speech output
  const toggleMute = () => {
    if (!isMuted && isSpeaking) {
      // Stop any currently playing audio
      if (useOpenAI && currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
        setIsSpeaking(false);
      } else if (!useOpenAI && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
    setIsMuted(!isMuted);
  };

  // Toggle between OpenAI and browser speech APIs
  const toggleSpeechAPI = () => {
    setUseOpenAI(!useOpenAI);
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
          {!isConnected && (
            <div className="bg-red-600 px-2 py-1 rounded text-xs font-medium">
              Not Connected
            </div>
          )}
          {useOpenAI && (
            <div className="bg-purple-600 px-2 py-1 rounded text-xs font-medium flex items-center">
              <Wand2 size={12} className="mr-1" />
              OpenAI Voice
            </div>
          )}
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
          <h3 className="font-medium mb-3 text-blue-300 flex items-center">
            Voice Settings
            <button
              onClick={toggleSpeechAPI}
              className={`ml-3 px-3 py-1 text-xs rounded-full transition-colors ${
                useOpenAI
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
              title="Toggle between OpenAI and browser speech APIs"
            >
              {useOpenAI ? 'Using OpenAI' : 'Using Browser API'}
            </button>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {useOpenAI ? (
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">OpenAI Voice</label>
                <select
                  className="bg-gray-700 border border-gray-600 rounded p-2 text-sm"
                  value={selectedOpenAIVoice}
                  onChange={(e) => setSelectedOpenAIVoice(e.target.value)}
                >
                  {openAIVoices.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Browser Voice</label>
                <select
                  className="bg-gray-700 border border-gray-600 rounded p-2 text-sm"
                  value={selectedBrowserVoice ? browserVoices.indexOf(selectedBrowserVoice) : 0}
                  onChange={(e) => setSelectedBrowserVoice(browserVoices[e.target.value])}
                >
                  {browserVoices.map((voice, index) => (
                    <option key={`${voice.name}-${index}`} value={index}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!useOpenAI && (
              <>
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
              </>
            )}
          </div>

          <div className="mt-3 text-xs text-gray-400">
            {useOpenAI ?
              "OpenAI provides higher quality speech recognition and more natural sounding voices." :
              "Browser speech APIs work without additional API calls but may vary in quality across browsers."
            }
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
                      : isConnected
                        ? 'bg-blue-600 hover:bg-blue-500 hover:scale-105'
                        : 'bg-gray-600 cursor-not-allowed'
                  } shadow-lg shadow-blue-900/30`}
                  disabled={!isConnected || isProcessingAudio}
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
                    <audio ref={audioPlayerRef} src={audioURL} className="hidden" onEnded={() => setIsPlaying(false)} />
                    <div className="text-sm text-gray-400">
                      {isPlaying ? "Playing recording..." : "Review recording"}
                    </div>
                  </div>
                )}
              </div>

              {(audioBlob || transcribedText) && (
                <button
                  onClick={sendVoiceMessage}
                  className={`px-4 py-2 rounded flex items-center gap-2 transition-colors shadow-md ${
                    isConnected && !isProcessingAudio
                      ? 'bg-blue-600 hover:bg-blue-500 hover:shadow-lg'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                  disabled={!isConnected || isProcessingAudio}
                >
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </button>
              )}
            </div>``

            <div className="text-xs text-gray-400 text-center">
              {isProcessingAudio ? (
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce mr-1" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce mr-1" style={{ animationDelay: '300ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                  <span className="ml-2">Processing audio with OpenAI...</span>
                </div>
              ) : (
                statusText
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityVoiceChat;