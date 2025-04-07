// src/server.js - Updated with Socket.IO configuration
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { initializeUniversityVoiceAssistant } = require('./server/universityVoiceAssistant');

// Get environment variables
require('dotenv').config();

// Create Express app
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Add health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Initialize university voice assistant
const io = initializeUniversityVoiceAssistant(server, {
  apiKeys: {
    llm: process.env.LLM_API_KEY
  }
});

// Routes for the web app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 4000; // Using port 4000 to match the nginx configuration
server.listen(PORT, () => {
  console.log(`Voice Assistant Server running on port ${PORT}`);
});