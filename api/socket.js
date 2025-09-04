const { Server } = require('socket.io');
const { authorizedProjects } = require('../middleware/auth');

let io = null;

export default function handler(req, res) {
  if (!io) {
    // Crear servidor Socket.IO solo una vez
    io = new Server(res.socket.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Configurar eventos de Socket.IO
    io.on('connection', (socket) => {
      console.log(`Cliente conectado: ${socket.id}`);
      
      // Unirse a la sala de contactos
      socket.join('contacts-room');
      
      // Manejar autenticación de proyecto
      socket.on('authenticate', (data) => {
        const { apiKey } = data;
        const project = authorizedProjects[apiKey];
        
        if (project) {
          socket.project = project;
          socket.emit('authenticated', { 
            success: true, 
            project: project.name,
            features: project.features 
          });
          console.log(`Proyecto autenticado: ${project.name} (${socket.id})`);
        } else {
          socket.emit('authenticated', { 
            success: false, 
            message: 'Invalid API key' 
          });
        }
      });
      
      // Manejar desconexión
      socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${socket.id}`);
      });
    });

    // Hacer io disponible globalmente
    global.io = io;
  }

  res.end();
}
