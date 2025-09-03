const validApiKeys = new Set([
  'sk-1234567890abcdef-user1',
  'sk-0987654321fedcba-user2'
]);

const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key required. Include x-api-key header or Authorization: Bearer <key>'
    });
  }
  
  if (!validApiKeys.has(apiKey)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid API key'
    });
  }
  
  // Agregar info del usuario al request
  req.user = {
    id: apiKey === 'sk-1234567890abcdef-user1' ? 'user1' : 'user2',
    apiKey: apiKey
  };
  
  next();
};

module.exports = { authenticateApiKey };
