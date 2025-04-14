import { Router } from 'express';
import policyApiRouter from './api/index.js';

// Create the main API router
const apiRouter = Router();

// Apply API versioning
apiRouter.use('/v1', policyApiRouter);

// Add a health check endpoint
apiRouter.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Default handler for unknown routes
apiRouter.use((req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    status: 404
  });
});

// Export the API router
export default apiRouter; 