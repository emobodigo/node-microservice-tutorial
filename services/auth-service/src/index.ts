import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Setup middleware
app.use(cors());
app.use(helmet());

// Parse JSON Bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`Auth Service is running on port ${port}`);
  console.log(`Environtment: ${process.env.NODE_ENV}`);
  console.log(`Health check: http://localhost:${port}/health`);
});

export default app;
