// Middleware para validar features por proyecto
const checkFeature = (requiredFeature) => {
  return (req, res, next) => {
    if (!req.project) {
      return res.status(401).json({
        success: false,
        message: 'Project authentication required'
      });
    }
    
    if (!req.project.features.includes(requiredFeature)) {
      return res.status(403).json({
        success: false,
        message: `Feature '${requiredFeature}' not allowed for this project`,
        project: req.project.name,
        allowedFeatures: req.project.features
      });
    }
    
    next();
  };
};

module.exports = { checkFeature };
