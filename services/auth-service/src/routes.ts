import { validateRequest } from "@shared/middlewares";
import { Router } from "express";
import * as authController from "./authController";
import { loginSchema, registerSchema } from "./validation";

const router = Router();

// public routes
router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register
);
router.post("/login", validateRequest(loginSchema), authController.login);
