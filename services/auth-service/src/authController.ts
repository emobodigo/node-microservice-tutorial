import { asyncHandler } from "@shared/middlewares";
import { createSuccessResponse } from "@shared/utils";
import { Request, Response } from "express";
import { AuthService } from "./authService";

const authService = new AuthService();

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const tokens = await authService.register(email, password);

  res
    .status(201)
    .json(createSuccessResponse(tokens, "User Registered successfully"));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const token = await authService.login(email, password);

  res
    .status(200)
    .json(createSuccessResponse(token, "User logged in successfully"));
});
