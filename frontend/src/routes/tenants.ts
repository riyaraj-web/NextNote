import express from 'express';
import { upgradeTenant } from '../controllers/tenantController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

router.post('/:slug/upgrade', authenticateToken, requireRole(['admin']), upgradeTenant);

export default router;