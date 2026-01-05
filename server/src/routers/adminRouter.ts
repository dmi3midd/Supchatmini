import { Router } from "express";
import { body } from "express-validator";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { accessMiddleware } from "../middlewares/accessMiddlewares.js";
import adminController from "../controllers/adminController.js";

const router = Router();

router.get('/get-admin-by-id', authMiddleware, adminController.getAdminById);
router.post('/create-agent', authMiddleware, accessMiddleware(['manager', 'superadmin']), adminController.createAgent);
router.post('/create-manager', authMiddleware, accessMiddleware(['superadmin']), adminController.createManager);
router.delete('/delete-admin', authMiddleware, adminController.deleteAdmin);

export default router;