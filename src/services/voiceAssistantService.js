// src/services/voiceAssistantService.js

import { io } from "socket.io-client";

class VoiceAssistantService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventHandlers = {
      connect: [],
      disconnect: [],
      processingStart: [],
      llmResponse: [],
      error: []
    };
  }

  /**
   * Initialize the voice assistant service
   * @param {string} serverUrl - Socket.io server URL (optional)
   * @returns {Promise} - Resolves when connection is established
   */
  initialize(serverUrl = '') {
    return new Promise((resolve, reject) => {
      try {
        // Use the current host if no server URL is provided
        const url = serverUrl || window.location.origin;

        // Initialize socket connection
        this.socket = io(url);

        // Set up default event handlers
        this.socket.on('connect', () => {
          console.log('Connected to voice assistant server');
          this.isConnected = true;
          this._triggerEvent('connect');
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('Disconnected from voice assistant server');
          this.isConnected = false;
          this._triggerEvent('disconnect');
        });

        this.socket.on('processingStart', () => {
          this._triggerEvent('processingStart');
        });

        this.socket.on('llmResponse', (data) => {
          this._triggerEvent('llmResponse', data);
        });

        this.socket.on('error', (data) => {
          console.error('Voice assistant error:', data);
          this._triggerEvent('error', data);
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          this.isConnected = false;
          reject(error);
        });
      } catch (error) {
        console.error('Failed to initialize voice assistant service:', error);
        reject(error);
      }
    });
  }

  /**
   * Send a speech message to the server
   * @param {string} text - Transcribed speech text
   * @returns {boolean} - Success status
   */
  sendSpeech(text) {
    if (!this.isConnected || !this.socket) {
      console.error('Cannot send speech: not connected');
      return false;
    }

    this.socket.emit('speech', { text });
    return true;
  }

  /**
   * Register an event handler
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  on(event, callback) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }

    this.eventHandlers[event].push(callback);
  }

  /**
   * Remove an event handler
   * @param {string} event - Event name
   * @param {Function} callback - Event callback to remove
   */
  off(event, callback) {
    if (!this.eventHandlers[event]) return;

    this.eventHandlers[event] = this.eventHandlers[event].filter(
      handler => handler !== callback
    );
  }

  /**
   * Disconnect from the server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Trigger event callbacks
   * @param {string} event - Event name
   * @param {any} data - Event data
   * @private
   */
  _triggerEvent(event, data) {
    if (!this.eventHandlers[event]) return;

    for (const handler of this.eventHandlers[event]) {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in ${event} handler:`, error);
      }
    }
  }

  /**
   * Get connection status
   * @returns {boolean} - Whether connected to server
   */
  isActive() {
    return this.isConnected;
  }
}

// Create a singleton instance
const voiceAssistantService = new VoiceAssistantService();

export default voiceAssistantService;