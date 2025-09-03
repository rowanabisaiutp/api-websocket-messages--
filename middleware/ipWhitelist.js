// Lista de IPs permitidas
const allowedIPs = new Set([
  '192.168.1.100',  // IP del usuario 1
  '192.168.1.101',  // IP del usuario 2
  '127.0.0.1',      // Localhost para testing
  // Agrega las IPs públicas de tus usuarios
]);

const checkIPWhitelist = (req, res, next) => {
  // Obtener IP real (considerando proxies)
  const clientIP = req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   (req.connection.socket ? req.connection.socket.remoteAddress : null);

  // Limpiar IP (remover puerto si existe)
  const cleanIP = clientIP ? clientIP.split(':')[0] : null;
  
  if (!cleanIP || !allowedIPs.has(cleanIP)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied from this IP address',
      yourIP: cleanIP
    });
  }
  
  req.clientIP = cleanIP;
  next();
};

module.exports = { checkIPWhitelist };
