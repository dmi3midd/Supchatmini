import { Router } from "express";
import { body } from "express-validator";

import authController from "../controllers/authController.js";

const router = Router();

router.post(
    "/login",
    body("email").isEmail(),
    authController.login
);
router.post(
    "/logout",
    authController.logout
);
router.get(
    "/refresh",
    authController.refresh
);

export default router;