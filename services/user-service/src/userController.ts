import { asyncHandler } from "@shared/middlewares";
import { createErrorResponse, createSuccessResponse } from "@shared/utils";
import { NextFunction, Request, Response } from "express";
import { UserService } from "./userService";

const userService = new UserService();

export const getProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json(createErrorResponse("User not authenticated"));
  }

  const profile = await userService.getProfile(userId);

  return res.status(200).json(createSuccessResponse(profile, "User profile retrieved successfully"));
});

export const updateProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json(createErrorResponse("User not authenticated"));
  }

  const profile = await userService.updateProfile(userId, req.body);

  return res.status(200).json(createSuccessResponse(profile, "User profile updated successfully"));
});

export const deleteProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json(createErrorResponse("User not authenticated"));
  }

  await userService.deleteProfile(userId);

  return res.status(200).json(createSuccessResponse(null, "User profile deleted successfully"));
});
