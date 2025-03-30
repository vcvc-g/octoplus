// src/server.js
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { initializeVoiceAssistant } = require('./server/voiceAssistant');

// Get environment variables
require('dotenv').config();

// Create Express app
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize voice assistant
initializeVoiceAssistant(server, {
  apiKeys: {
    llm: process.env.LLM_API_KEY
  }
});

// Routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});