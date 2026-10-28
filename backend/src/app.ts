import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { errorResponse, successResponse } from './utils/api-response';

dotenv.config();

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(
  cors({
    origin: corsOrigin.includes(',') ? corsOrigin.split(',') : corsOrigin,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  successResponse(res, 200, 'Azatech API Service is Healthy');
});

// Main API routes
app.use('/api', apiRoutes);

// 404 fallback for undefined routes
app.use((_req, res) => {
  errorResponse(res, 404, 'Endpoint tidak ditemukan');
});

// Central error handling middleware
app.use(errorHandler);

export default app;
