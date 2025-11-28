import { AuthService } from "../src/authService";

// mock external dependencis
jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

jest.mock("uuid", () => ({
  v4: jest.fn(),
}));

// import mocked modules
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import {
  expectServiceError,
  resetAllMocks,
  testJwtPayload,
  testRefreshToken,
  testUser,
} from "./setup";

const mockedUuidv4 = uuidv4 as unknown as jest.Mock<string, []>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe("AuthService", () => {
  let authService: AuthService;

  beforeAll(() => {
    resetAllMocks();
    authService = new AuthService();

    // setup default mock implementations
    mockedUuidv4.mockReturnValue("test-uuid-1234");
    (mockedBcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
    (mockedJwt.sign as jest.Mock).mockReturnValue("test-jwt-token");
    (mockedJwt.verify as jest.Mock).mockReturnValue(testJwtPayload);
  });

  describe("constructor", () => {
    it("should initialize with environtment variables", () => {
      expect(authService).toBeInstanceOf(AuthService);
    });

    it("should throw an error if JWT_SECRET is not configured", () => {
      delete process.env.JWT_SECRET;
      expect(() => new AuthService()).toThrow(
        "JWT secret are not defined in environtment variables"
      );
      process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-only";
    });

    it("should throw an error if JWT_REFRESH_SECRET is not configured", () => {
      delete process.env.JWT_REFRESH_SECRET;
      expect(() => new AuthService()).toThrow(
        "JWT secret are not defined in environtment variables"
      );
      process.env.JWT_REFRESH_SECRET =
        "test-jwt-refresh-secret-key-for-testing-only";
    });
  });

  describe("register", () => {
    const email = "testuser@domain.com";
    const password = "testpassword";

    it("should successfully register a new user", async () => {
      global.mockPrisma.user.findUnique.mockResolvedValue(null);
      global.mockPrisma.user.create.mockResolvedValue(testUser);
      global.mockPrisma.refreshToken.create.mockResolvedValue(testRefreshToken);

      const result = await authService.register(email, password);

      expect(global.mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, 4);
      expect(global.mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email,
          password: "hashed-password",
        },
      });
      expect(result).toEqual({
        accessToken: "test-jwt-token",
        refreshToken: "test-jwt-token",
      });
    });

    it("should throw an error if user already exists", async () => {
      global.mockPrisma.user.findUnique.mockResolvedValue(testUser);

      await expectServiceError(
        () => authService.register(email, password),
        "User already exists",
        409
      );

      expect(global.mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it("should handle database error during creation", async () => {
      global.mockPrisma.user.findUnique.mockResolvedValue(null);
      global.mockPrisma.user.create.mockRejectedValue(new Error("DB Error"));

      await expect(authService.register(email, password)).rejects.toThrow(
        "DB Error"
      );
    });
  });
});
