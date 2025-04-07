// src/server/universityVoiceAssistant.js - Updated with OpenAI integration

const socketIo = require('socket.io');
const axios = require('axios');
const logger = require('./utils/logger');  // Use existing logger from the code base

/**
 * University Explorer Voice Assistant System Prompt
 */
const universityExplorerPrompt = `
You are a helpful university exploration assistant for the University Explorer application.
You provide information, guidance, and advice to students about:

1. Top global universities like MIT, Harvard, Stanford, Oxford, Cambridge, and others
2. Different major options and their career prospects
3. Admission requirements and acceptance rates
4. Strategies to improve admission chances
5. How to determine which universities match a student's profile
6. Information about the student profile settings in the application

Your responses should be concise, informative, and conversational. Keep answers brief but helpful.
When discussing admission chances, mention that the user can set their profile details in the
student profile section to see personalized recommendations.

The University Explorer application shows universities color-coded by admission chances:
- Green: Safety schools (80%+ chance)
- Yellow: Target schools (40-79% chance)
- Red: Reach schools (below 40% chance)

When relevant, mention how the student's SAT scores, GPA, course rigor, extracurriculars, and other
factors can affect admission chances at specific universities.

Respond in a friendly, encouraging tone. If asked questions outside the scope of university exploration,
politely redirect the conversation back to university-related topics.
`;

/**
 * Initialize the university voice assistant server functionality
 * @param {Object} server - Express HTTP server instance
 * @param {Object} config - Application configuration
 */
function initializeUniversityVoiceAssistant(server, config) {
  // Initialize socket.io with CORS config
  const io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Keep track of conversation history for each client
  const conversationHistory = new Map();

  // LLM API configuration
  const llmConfig = {
    apiKey: process.env.OPENAI_API_KEY || config.apiKeys.llm,
    apiUrl: process.env.OPENAI_API_URL || 'https://api.openai.com/v1',
    model: process.env.OPENAI_MODEL || 'gpt-4o'
  };

  // Socket connection handler
  io.on('connection', (socket) => {
    logger.info(`University voice assistant client connected: ${socket.id}`);

    // Initialize conversation history for this client
    conversationHistory.set(socket.id, [
      { role: "system", content: universityExplorerPrompt }
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

        // Call OpenAI API for response
        const response = await callOpenAIAPI(history, llmConfig);

        // Extract response text
        const responseText = response.choices[0].message.content;
        logger.info(`Response to ${socket.id}: ${responseText.substring(0, 100)}...`);

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
      logger.info(`University voice assistant client disconnected: ${socket.id}`);
      // Clean up conversation history
      conversationHistory.delete(socket.id);
    });
  });

  logger.info('University voice assistant functionality initialized');
  return io;
}

/**
 * Call the OpenAI API to generate a response
 * @param {Array} messages - Conversation history
 * @param {Object} config - API configuration
 * @returns {Promise<Object>} - API response
 */
async function callOpenAIAPI(messages, config) {
  try {
    logger.debug('Calling OpenAI API with messages:', messages);

    const response = await axios.post(
      `${config.apiUrl}/chat/completions`,
      {
        model: config.model,
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        }
      }
    );

    logger.debug('OpenAI API response status:', response.status);
    return response.data;
  } catch (error) {
    logger.error('OpenAI API error:', error.response?.data || error.message);

    // Return a fallback response
    return {
      choices: [{
        message: {
          content: "I'm sorry, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment or check out the university list in the main explorer view."
        }
      }]
    };
  }
}

module.exports = { initializeUniversityVoiceAssistant };