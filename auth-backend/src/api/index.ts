// API routing structure for the application
import express from 'express';
import { personalizeRouter } from './personalize';
import { personalizedRouter } from './personalized';

const router = express.Router();

// Mount personalization API routes
router.use('/personalize', personalizeRouter);
router.use('/personalized', personalizedRouter);

export default router;