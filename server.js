const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const contactRoutes = require('./routes/contacts');

const { authenticateProject, authorizedProjects } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // En producción, especifica los dominios permitidos
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// SOCKET.IO CONFIGURATION
// ========================================

// Routes (protegidas por proyecto)
app.use('/api/contacts', authenticateProject, contactRoutes);

// ========================================
// MESSAGE SYSTEM FOR WEB TO MOBILE
// ========================================
// Los mensajes se envían via WebSocket POST event (ver configuración de Socket.IO)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running', 
    timestamp: new Date().toISOString() 
  });
});

// ========================================
// SOCKET.IO TEST ENDPOINT
// ========================================
app.get('/test-socket-emit', (req, res) => {
  const io = req.app.get('io') || global.io;
  
  if (io) {
    const testData = {
      success: true,
      data: { id: 999, name: 'Test User', email: 'test@example.com' },
      message: 'Mensaje de prueba desde endpoint',
      timestamp: new Date().toISOString(),
      project: 'Test Project'
    };
    
    console.log('🧪 Enviando mensaje de prueba a contacts-room');
    io.to('contacts-room').emit('new-contact', testData);
    
    res.json({
      success: true,
      message: 'Evento de prueba enviado a todos los clientes conectados',
      data: testData
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Socket.IO no está disponible'
    });
  }
});

// ========================================
// TEST ENDPOINT FOR WEB TO MOBILE
// ========================================
app.get('/test-web-message', (req, res) => {
  const io = req.app.get('io') || global.io;
  
  if (io) {
    const testMessage = {
      success: true,
      data: { 
        id: 888, 
        name: 'Test Web User', 
        email: 'test@web.com',
        subject: 'Mensaje de prueba desde web',
        message: 'Este es un mensaje de prueba enviado desde la web'
      },
      message: 'Mensaje de prueba desde web',
      timestamp: new Date().toISOString(),
      type: 'web_message',
      source: 'web_form'
    };
    
    console.log('🧪 Enviando mensaje de prueba a admin-room');
    io.to('admin-room').emit('new-message', testMessage);
    
    res.json({
      success: true,
      message: 'Mensaje de prueba enviado a la app móvil (admin-room)',
      data: testMessage
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Socket.IO no está disponible'
    });
  }
});

// ========================================
// SOCKET.IO DOCUMENTATION ENDPOINT
// ========================================
app.get('/socket-docs', (req, res) => {
  res.json({
    success: true,
    message: 'Socket.IO API Documentation',
    socketUrl: 'https://api-websocket-messages.vercel.app',
    connection: {
      url: 'wss://api-websocket-messages.vercel.app/socket.io/',
      transport: 'websocket',
      version: '4.7.2'
    },
    authentication: {
      event: 'authenticate',
      payload: { apiKey: 'YOUR_PROJECT_API_KEY' },
      response: 'authenticated'
    },
    events: {
      incoming: {
        'authenticated': 'Confirmation of successful authentication',
        'new-contact': 'Emitted automatically when POST /api/contacts creates a new message',
        'contact-deleted': 'Emitted automatically when DELETE /api/contacts/:id deletes a message',
        'new-message': 'Emitted to admin room when WebSocket POST creates a new message from web',
        'POST_response': 'Response to WebSocket POST request'
      },
      outgoing: {
        'authenticate': 'Authenticate with project API key and role (admin/client)',
        'POST': 'Send message from web to mobile app via WebSocket'
      }
    },
    triggers: {
      'new-contact': {
        trigger: 'POST /api/contacts',
        description: 'Automatically emitted when a new contact message is created',
        payload: {
          success: true,
          data: 'Contact object',
          message: 'Nuevo mensaje de contacto recibido',
          timestamp: 'ISO timestamp',
          project: 'Project name'
        }
      },
      'contact-deleted': {
        trigger: 'DELETE /api/contacts/:id',
        description: 'Automatically emitted when a contact message is deleted',
        payload: {
          success: true,
          contactId: 'Deleted contact ID',
          message: 'Mensaje de contacto eliminado',
          timestamp: 'ISO timestamp',
          project: 'Project name'
        }
      },
      'new-message': {
        trigger: 'WebSocket POST event',
        description: 'Emitted to admin room when a new message is sent from web via WebSocket',
        payload: {
          success: true,
          data: 'Contact object',
          message: 'Nuevo mensaje recibido desde la web',
          timestamp: 'ISO timestamp',
          type: 'web_message',
          source: 'web_form'
        }
      }
    },
    projects: {
      'proj_abc123def456_project1': {
        name: 'Proyecto Web Principal',
        features: ['read', 'write', 'delete'],
        rateLimit: '1000 requests/hour'
      },
      'proj_xyz789ghi012_project2': {
        name: 'Aplicación Móvil',
        features: ['read', 'write'],
        rateLimit: '500 requests/hour'
      }
    },
    examples: {
      webForm: `
// Enviar mensaje desde formulario web via WebSocket (JavaScript)
const socket = io('https://api-websocket-messages.vercel.app');

// Conectar y autenticar
socket.emit('authenticate', { 
  apiKey: 'proj_abc123def456_project1',
  role: 'client'
});

// Escuchar respuesta de autenticación
socket.on('authenticated', (data) => {
  console.log('Web autenticada:', data);
});

// Enviar mensaje via WebSocket POST
const sendMessage = (formData) => {
  socket.emit('POST', {
    name: formData.name,
    email: formData.email,
    subject: formData.subject,
    message: formData.message
  });
};

// Escuchar respuesta del POST
socket.on('POST_response', (data) => {
  console.log('Respuesta del mensaje:', data);
});
      `,
      mobileApp: `
// App móvil - Conectar como administrador (JavaScript)
const socket = io('https://api-websocket-messages.vercel.app');

// Autenticar como administrador
socket.emit('authenticate', { 
  apiKey: 'proj_xyz789ghi012_project2',
  role: 'admin'
});

// Escuchar notificaciones de mensajes
socket.on('authenticated', (data) => {
  console.log('App móvil autenticada como admin:', data);
});

socket.on('new-message', (data) => {
  console.log('Nuevo mensaje recibido:', data);
  // Mostrar notificación push o actualizar UI
});
      `,
      flutter: `
// pubspec.yaml
dependencies:
  socket_io_client: ^2.0.3+1

// Dart code - App móvil como administrador
import 'package:socket_io_client/socket_io_client.dart' as IO;

final socket = IO.io('https://api-websocket-messages.vercel.app');

// Conectar como administrador
socket.emit('authenticate', {
  'apiKey': 'proj_xyz789ghi012_project2',
  'role': 'admin'
});

// Escuchar notificaciones
socket.on('authenticated', (data) {
  print('App móvil autenticada: \$data');
});

socket.on('new-message', (data) {
  print('Nuevo mensaje: \$data');
  // Mostrar notificación push
});
      `
    }
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
    message: 'Contact Messages CRUD API with Socket.IO',
    endpoints: {
      'GET /api/contacts': 'Get all contact messages (requires API key)',
      'GET /api/contacts/:id': 'Get contact message by ID (requires API key)',
      'POST /api/contacts': 'Create new contact message (requires API key)',
      'PUT /api/contacts/:id': 'Update contact message (requires API key)',
      'DELETE /api/contacts/:id': 'Delete contact message (requires API key)',
      'GET /api/contacts/email/:email': 'Get messages by email (requires API key)',
      'WebSocket POST': 'Send message from web to mobile app via WebSocket',
      'GET /health': 'Health check',
      'GET /test-socket-emit': 'Test Socket.IO connection (contacts-room)',
      'GET /test-web-message': 'Test web to mobile message (admin-room)',
      'GET /socket-docs': 'Socket.IO API Documentation'
    },
    socketIO: {
      url: 'https://api-websocket-messages.vercel.app',
      events: ['connect', 'authenticate', 'new-contact', 'contact-deleted', 'new-message'],
      roles: {
        admin: 'App móvil - recibe notificaciones de mensajes',
        client: 'Cliente web - puede enviar mensajes'
      },
      apiKeys: {
        project1: 'proj_abc123def456_project1',
        project2: 'proj_xyz789ghi012_project2'
      }
    },
    webToMobile: {
      description: 'Sistema para enviar mensajes desde web a app móvil',
      webMethod: 'WebSocket POST event',
      mobileNotification: 'Socket event: new-message',
      room: 'admin-room',
      response: 'Socket event: POST_response'
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

// Hacer io disponible globalmente
app.set('io', io);
global.io = io;

// Configurar Socket.IO
io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`);
  
  // Unirse a la sala de contactos (para compatibilidad con el sistema anterior)
  socket.join('contacts-room');
  console.log(`📝 Cliente ${socket.id} se unió a la sala 'contacts-room'`);
  
  // Manejar autenticación de proyecto
  socket.on('authenticate', (data) => {
    const { apiKey, role } = data;
    const project = authorizedProjects[apiKey];
    
    if (project) {
      socket.project = project;
      socket.role = role || 'client'; // Por defecto es cliente
      
      // Si es administrador (app móvil), unirse a la sala de administradores
      if (role === 'admin' || project.name === 'Aplicación Móvil') {
        socket.join('admin-room');
        socket.role = 'admin';
        console.log(`👑 Administrador conectado: ${project.name} (${socket.id})`);
        socket.emit('authenticated', { 
          success: true, 
          project: project.name,
          features: project.features,
          role: 'admin',
          message: 'Conectado como administrador - recibirás notificaciones de mensajes'
        });
      } else {
        console.log(`✅ Proyecto autenticado: ${project.name} (${socket.id})`);
        socket.emit('authenticated', { 
          success: true, 
          project: project.name,
          features: project.features,
          role: 'client'
        });
      }
    } else {
      socket.emit('authenticated', { 
        success: false, 
        message: 'Invalid API key' 
      });
      console.log(`❌ Autenticación fallida para ${socket.id} con API key: ${apiKey?.substring(0, 20)}...`);
    }
  });
  
  // Manejar envío de mensajes desde WebSocket (POST)
  socket.on('POST', async (data) => {
    try {
      const { name, email, subject, message } = data;
      
      // Basic validation
      if (!name || !email || !subject || !message) {
        socket.emit('POST_response', {
          success: false,
          message: 'All fields (name, email, subject, message) are required'
        });
        return;
      }

      // Crear el mensaje en la base de datos
      const Contact = require('./models/Contact');
      const contactId = await Contact.create({ name, email, subject, message });
      const newContact = await Contact.findById(contactId);
      
      // Emitir notificación a la app móvil (administrador)
      const notificationData = {
        success: true,
        data: newContact,
        message: 'Nuevo mensaje recibido desde la web',
        timestamp: new Date().toISOString(),
        type: 'web_message',
        source: 'web_form'
      };
      
      console.log('📱 Enviando notificación a app móvil:', notificationData);
      // Enviar solo a la sala de administradores (app móvil)
      io.to('admin-room').emit('new-message', notificationData);
      console.log('✅ Notificación enviada a app móvil');
      
      // Responder al cliente que envió el mensaje
      socket.emit('POST_response', {
        success: true,
        data: newContact,
        message: 'Mensaje enviado exitosamente a la app móvil'
      });
      
    } catch (error) {
      console.error('Error enviando mensaje via WebSocket:', error);
      socket.emit('POST_response', {
        success: false,
        message: 'Error enviando mensaje',
        error: error.message
      });
    }
  });
  
  // Manejar desconexión
  socket.on('disconnect', () => {
    const role = socket.role || 'unknown';
    console.log(`🔌 Cliente desconectado: ${socket.id} (${role})`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/contacts`);
  console.log(`Socket.IO available at http://localhost:${PORT}`);
});
