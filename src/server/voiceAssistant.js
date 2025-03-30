// src/server/voiceAssistant.js - Server-side voice assistant integration

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const logger = require('./utils/logger');  // Use existing logger from the code base

/**
 * Initialize the voice assistant server functionality
 * @param {Object} server - Express HTTP server instance
 * @param {Object} config - Application configuration
 */
function initializeVoiceAssistant(server, config) {
  // Initialize socket.io with CORS config
  const io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Keep track of conversation history for each client
  const conversationHistory = new Map();

  // LLM API configuration (use environment variables in real implementation)
  const llmConfig = {
    apiKey: process.env.LLM_API_KEY || config.apiKeys.llm,
    apiUrl: process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions',
    model: process.env.LLM_MODEL || 'gpt-3.5-turbo'
  };

  // University data context to help the assistant provide more relevant answers
  const universityContext = `
    You are a university advisor assistant who helps students with college and university-related questions.
    You have access to data on top universities including MIT, Harvard, Stanford, Oxford, Cambridge, and others.
    You know about their acceptance rates, SAT/GPA requirements, and popular programs.
    Focus your answers on helping students find universities that match their interests and qualifications.
    Keep responses concise, informative, and encouraging.
  `;

  // Socket connection handler
  io.on('connection', (socket) => {
    logger.info(`Voice assistant client connected: ${socket.id}`);

    // Initialize conversation history for this client
    conversationHistory.set(socket.id, [
      { role: "system", content: universityContext }
    ]);

    // Handle speech-to-text input from client
    socket.on('speech', async (speechData) => {
      try {
        // Extract the user's message
        const userMessage = speechData.text;
        logger.info(`Received voice message from ${socket.id}: ${userMessage}`);

        // Add user message to conversation history
        const history = conversationHistory.get(socket.id);
        history.push({ role: "user", content: userMessage });

        // Let client know we're processing
        socket.emit('processingStart');

        // Call LLM API for response
        const response = await callLLMAPI(history, llmConfig);

        // Extract response text
        const responseText = response.choices[0].message.content;

        // Add AI response to conversation history
        history.push({ role: "assistant", content: responseText });

        // Truncate history if it gets too long (to save tokens)
        if (history.length > 12) {
          // Keep system message and last 6 exchanges
          const systemMessage = history[0];
          const recentMessages = history.slice(-12);
          conversationHistory.set(socket.id, [systemMessage, ...recentMessages]);
        }

        // Send response back to client
        socket.emit('llmResponse', {
          text: responseText
        });

      } catch (error) {
        logger.error('Error processing speech:', error);
        socket.emit('error', {
          message: 'Error processing your request. Please try again.'
        });
      }
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
      logger.info(`Voice assistant client disconnected: ${socket.id}`);
      // Clean up conversation history
      conversationHistory.delete(socket.id);
    });
  });

  logger.info('Voice assistant functionality initialized');
  return io;
}

/**
 * Call the LLM API to generate a response
 * @param {Array} messages - Conversation history
 * @param {Object} config - API configuration
 * @returns {Promise<Object>} - API response
 */
async function callLLMAPI(messages, config) {
  try {
    const response = await axios.post(
      config.apiUrl,
      {
        model: config.model,
        messages: messages,
        max_tokens: 300,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        }
      }
    );

    return response.data;
  } catch (error) {
    logger.error('LLM API error:', error);

    // Return a fallback response
    return {
      choices: [{
        message: {
          content: "I'm sorry, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment."
        }
      }]
    };
  }
}

module.exports = { initializeVoiceAssistant };