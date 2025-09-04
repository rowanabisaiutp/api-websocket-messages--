// Proyectos autorizados con sus configuraciones
const authorizedProjects = {
  'proj_abc123def456_project1': {
    name: 'Proyecto Web Principal',
    domain: 'mi-proyecto-web.com',
    allowedOrigins: ['https://api-websocket-messages.vercel.app', 'https://api-websocket-messages.vercel.app'],
    rateLimit: { requests: 1000, window: '1h' },
    features: ['read', 'write', 'delete']
  },  
  'proj_xyz789ghi012_project2': {
    name: 'Aplicación Móvil',
    domain: 'mi-app-movil.com',
    allowedOrigins: ['https://api-websocket-messages.vercel.app', 'https://api-websocket-messages.vercel.app'],
    rateLimit: { requests: 500, window: '1h' },
    features: ['read', 'write']
  }
};

// Rate limiting por proyecto
const projectRequests = new Map();

const authenticateProject = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  const origin = req.headers['origin'] || req.headers['referer'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'Project API key required. Include x-api-key header or Authorization: Bearer <key>',
      documentation: 'Contact admin to get your project API key'
    });
  }
  
  const project = authorizedProjects[apiKey];
  if (!project) {
    return res.status(403).json({
      success: false,
      message: 'Invalid project API key',
      hint: 'This API key is not authorized for any project'
    });
  }
  
  // Validar origen (opcional, para mayor seguridad)
  if (origin && project.allowedOrigins.length > 0) {
    // Permitir archivos locales y localhost para desarrollo
    const isLocalFile = origin === 'null' || origin === 'file://' || origin.includes('localhost') || origin.includes('127.0.0.1');
    const isAllowedOrigin = isLocalFile || project.allowedOrigins.some(allowedOrigin => 
      origin.includes(allowedOrigin.replace('https://', '').replace('http://', ''))
    );
    
    if (!isAllowedOrigin) {
      return res.status(403).json({
        success: false,
        message: 'Origin not allowed for this project',
        yourOrigin: origin,
        allowedOrigins: project.allowedOrigins,
        note: 'Local files and localhost are allowed for development'
      });
    }
  }
  
  // Rate limiting
  const now = Date.now();
  const windowMs = getWindowMs(project.rateLimit.window);
  const projectKey = `${apiKey}_${Math.floor(now / windowMs)}`;
  
  const currentRequests = projectRequests.get(projectKey) || 0;
  if (currentRequests >= project.rateLimit.requests) {
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded for this project',
      limit: project.rateLimit.requests,
      window: project.rateLimit.window,
      resetTime: new Date(Math.ceil(now / windowMs) * windowMs).toISOString()
    });
  }
  
  projectRequests.set(projectKey, currentRequests + 1);
  
  // Agregar info del proyecto al request
  req.project = {
    id: apiKey,
    name: project.name,
    domain: project.domain,
    features: project.features,
    rateLimit: project.rateLimit
  };
  
  next();
};

// Función auxiliar para convertir ventana de tiempo a milisegundos
function getWindowMs(window) {
  const units = {
    's': 1000,
    'm': 60 * 1000,
    'h': 60 * 60 * 1000,
    'd': 24 * 60 * 60 * 1000
  };
  
  const match = window.match(/^(\d+)([smhd])$/);
  if (!match) return 60 * 60 * 1000; // Default 1 hour
  
  const [, amount, unit] = match;
  return parseInt(amount) * units[unit];
}

module.exports = { authenticateProject, authorizedProjects };
