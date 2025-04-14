import { Router, Request, Response, NextFunction } from 'express';
import { getCurrentUserId } from '@/lib/auth.js';
import {
  getPolicies,
  getPolicyById,
  createOrUpdatePolicy,
  getPolicyTemplates,
  getPolicyTemplateByIdApi,
  createPolicyTemplate
} from '@/lib/api/policyApi.js';

// Create API router
const apiRouter = Router();

// Middleware to check for valid authentication
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    return res.status(401).json({ 
      error: 'Unauthorized: Authentication required',
      status: 401 
    });
  }
  
  // Add user ID to request
  req.userId = userId;
  next();
}

// API routes for policies
apiRouter.get('/policies', requireAuth, async (req: Request, res: Response) => {
  const includeInactive = req.query.includeInactive === 'true';
  const result = await getPolicies(includeInactive);
  
  return res.status(result.status).json(result);
});

apiRouter.get('/policies/:id', requireAuth, async (req: Request, res: Response) => {
  const result = await getPolicyById(req.params.id);
  
  return res.status(result.status).json(result);
});

apiRouter.post('/policies', requireAuth, async (req: Request, res: Response) => {
  const policy = req.body;
  const result = await createOrUpdatePolicy(policy, req.userId);
  
  return res.status(result.status).json(result);
});

apiRouter.put('/policies/:id', requireAuth, async (req: Request, res: Response) => {
  const policy = req.body;
  
  // Ensure ID in body matches URL parameter
  if (policy.id !== req.params.id) {
    return res.status(400).json({
      error: 'Policy ID in body does not match URL parameter',
      status: 400
    });
  }
  
  const result = await createOrUpdatePolicy(policy, req.userId);
  
  return res.status(result.status).json(result);
});

// API routes for policy templates
apiRouter.get('/templates', requireAuth, async (req: Request, res: Response) => {
  const result = await getPolicyTemplates();
  
  return res.status(result.status).json(result);
});

apiRouter.get('/templates/:id', requireAuth, async (req: Request, res: Response) => {
  const result = await getPolicyTemplateByIdApi(req.params.id);
  
  return res.status(result.status).json(result);
});

apiRouter.post('/templates', requireAuth, async (req: Request, res: Response) => {
  const { name, description, policyData } = req.body;
  
  if (!name || !policyData) {
    return res.status(400).json({
      error: 'Template name and policy data are required',
      status: 400
    });
  }
  
  const result = await createPolicyTemplate(
    name,
    description || '',
    policyData,
    req.userId
  );
  
  return res.status(result.status).json(result);
});

// Export the router
export default apiRouter; 