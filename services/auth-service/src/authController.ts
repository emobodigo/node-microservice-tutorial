import { asyncHandler } from "@shared/middlewares";
import { createErrorResponse, createSuccessResponse } from "@shared/utils";
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

export const refreshTokens = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const token = await authService.refreshToken(refreshToken);

    res
      .status(200)
      .json(createSuccessResponse(token, "Tokens refreshed succesfully"));
  }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);

  res
    .status(200)
    .json(createSuccessResponse(null, "User logged out succesfully"));
});

export const validateToken = asyncHandler(
  async (req: Request, res: Response) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json(createErrorResponse("No Token Provided"));
    }

    const payload = await authService.validateToken(token);

    return res
      .status(200)
      .json(createSuccessResponse(payload, "Token is valid"));
  }
);

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json(createErrorResponse("Unauthorized"));
  }

  const user = await authService.getUserById(userId);

  if (!user) {
    return res.status(404).json(createErrorResponse("User not found"));
  }

  return res
    .status(200)
    .json(createSuccessResponse(user, "User profile retrieved"));
});

export const deleteAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json(createErrorResponse("Unauthorized"));
    }

    await authService.deleteUser(userId);

    return res
      .status(200)
      .json(createSuccessResponse(null, "Account deleted successfully"));
  }
);
