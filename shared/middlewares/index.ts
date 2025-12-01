import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import jwt from "jsonwebtoken";
import { JWTPayload, logError, ServiceError } from "../types";
import { createErrorResponse } from "../utils";

// extend express request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json(createErrorResponse("Access token is required"));
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    logError(new Error("JWT Secret is not defined"));
    return res.status(500).json(createErrorResponse("Internal Server Error"));
  }

  jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json(createErrorResponse("Invalid Token"));
    }

    req.user = decoded as JWTPayload;
    next();
  });
}

export function validateRequest(schema: Joi.Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: true });

    if (error) {
      const errors: Record<string, string[]> = {};
      error.details.forEach((detail) => {
        const field = detail.path.join(".");
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(detail.message);
      });

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }
    return next();
  };
}

export function errorHandler(
  error: ServiceError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logError(error, {
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  res.status(statusCode).json(createErrorResponse(message));

  next();
}

export function corsOptions() {
  return {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: process.env.CORS_CREDENTIALS === "true",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["ContentType", "Authorization"],
  };
}
