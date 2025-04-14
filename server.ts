import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRouter from './src/routes/api';

// Create the express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mount the API router
app.use('/api', apiRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

// Handle errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    status: 500
  });
});