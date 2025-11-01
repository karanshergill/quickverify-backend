import express from 'express';
import authRoutes from '../auth/routes.js';
import couponRoutes from '../coupon/routes.js';
import apiConnectRoutes from '../apiConnect/routes.js';

const router = express.Router();

router.use('/', authRoutes);
router.use('/', couponRoutes);
router.use('/', apiConnectRoutes);

export default router;
