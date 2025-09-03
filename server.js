const express = require('express');
const cors = require('cors');
require('dotenv').config();

const contactRoutes = require('./routes/contacts');

const { authenticateProject, authorizedProjects } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (protegidas por proyecto)
app.use('/api/contacts', authenticateProject, contactRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running', 
    timestamp: new Date().toISOString() 
  });
});

// Endpoint para obtener información de proyectos (solo para administradores)
app.get('/api/projects', (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  
  const projectInfo = Object.entries(authorizedProjects).map(([key, config]) => ({
    projectId: key,
    name: config.name,
    domain: config.domain,
    allowedOrigins: config.allowedOrigins,
    rateLimit: config.rateLimit,
    features: config.features
  }));
  
  res.json({
    success: true,
    message: 'Authorized projects information',
    projects: projectInfo,
    usage: 'Include header: x-api-key: PROJECT_KEY'
  });
});

// Endpoint para verificar estado del proyecto
app.get('/api/project/status', authenticateProject, (req, res) => {
  res.json({
    success: true,
    message: 'Project authenticated successfully',
    project: {
      name: req.project.name,
      domain: req.project.domain,
      features: req.project.features,
      rateLimit: req.project.rateLimit
    },
    timestamp: new Date().toISOString()
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
