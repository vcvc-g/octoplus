// src/services/openAISpeechService.js
import axios from 'axios';

class OpenAISpeechService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1';
  }

  /**
   * Convert speech audio to text using OpenAI Whisper API
   * @param {Blob} audioBlob - Audio blob from recording
   * @returns {Promise<string>} - Transcribed text
   */
  async transcribeAudio(audioBlob) {
    try {
      // Create form data with the audio file
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');

      // Send request to OpenAI API
      const response = await axios.post(
        `${this.apiUrl}/audio/transcriptions`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  }

  /**
   * Convert text to speech using OpenAI TTS API
   * @param {string} text - Text to convert to speech
   * @param {string} voice - Voice to use (alloy, echo, fable, onyx, nova, shimmer)
   * @returns {Promise<Blob>} - Audio blob
   */
  async textToSpeech(text, voice = 'alloy') {
    try {
      // Validate voice parameter
      const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
      if (!validVoices.includes(voice)) {
        voice = 'alloy'; // Default to alloy if invalid voice
      }

      // Send request to OpenAI API
      const response = await axios.post(
        `${this.apiUrl}/audio/speech`,
        {
          input: text,
          model: 'tts-1',
          voice: voice,
          response_format: 'mp3'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      // Convert response to blob
      const audioBlob = new Blob([response.data], { type: 'audio/mp3' });
      return audioBlob;
    } catch (error) {
      console.error('Error converting text to speech:', error);
      throw new Error(`Failed to convert text to speech: ${error.message}`);
    }
  }
}

// Create a singleton instance
const openAISpeechService = new OpenAISpeechService();

export default openAISpeechService;