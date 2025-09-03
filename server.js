const express = require('express');
const cors = require('cors');
require('dotenv').config();

const contactRoutes = require('./routes/contacts');

const { authenticateApiKey } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (protegidas con API Key)
app.use('/api/contacts', authenticateApiKey, contactRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running', 
    timestamp: new Date().toISOString() 
  });
});

// Endpoint para obtener API Keys (solo para administradores)
app.get('/api/keys', (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  
  res.json({
    success: true,
    message: 'API Keys for authorized users',
    keys: [
      { user: 'user1', key: 'sk-1234567890abcdef-user1' },
      { user: 'user2', key: 'sk-0987654321fedcba-user2' }
    ],
    usage: 'Include header: x-api-key: YOUR_KEY'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Contact Messages CRUD API',
    endpoints: {
      'GET /api/contacts': 'Get all contact messages',
      'GET /api/contacts/:id': 'Get contact message by ID',
      'POST /api/contacts': 'Create new contact message',
      'PUT /api/contacts/:id': 'Update contact message',
      'DELETE /api/contacts/:id': 'Delete contact message',
      'GET /api/contacts/email/:email': 'Get messages by email',
      'GET /health': 'Health check'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/contacts`);
});
