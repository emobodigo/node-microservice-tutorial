import { authenticateToken, validateRequest } from "@shared/middlewares";
import { Router } from "express";
import * as userController from "./userController";
import { updateProfileSchema } from "./validation";

const router = Router();

// Protected Routes
router.get("/profile", authenticateToken, userController.getProfile);
router.put("/profile", authenticateToken, validateRequest(updateProfileSchema), userController.updateProfile);
router.delete("/profile", authenticateToken, userController.deleteProfile);

export default router;
