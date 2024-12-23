import express from "express";
import { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import httpErrors from "http-errors";
import dotenv from "dotenv";
import { mindmapRouter } from "@/router/mindmapRouter";
import { conversationRouter } from "@/router/conversationRouter";
import { openAPIRouter } from "./api-docs/openAPIRouter";
import { orgRouter } from "./router/orgRouter";
dotenv.config();
const app = express();

//Set trust proxy
app.set("trust proxy", true);

// Middleware configuration
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // Logger middleware

app.use(
  cors({
    origin: ["http://localhost:5173", /^https:\/\/.*\.mind-gpt\.online$/],
    allowedHeaders: ["Content-Type", "Authorization", "X-Custom-Header"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.use(openAPIRouter);

// Root route
app.get("/", async (req: Request, res: Response) => {
  res.status(200).send({ message: "Welcome to MindGPT" });
});

// Routes
app.use("/mindmap", mindmapRouter);
app.use("/org", orgRouter);
app.use("/conversation", conversationRouter);

app.use(async (req: Request, res: Response, next: NextFunction) => {
  next(httpErrors.BadRequest("Bad request"));
});

// Error handler
app.use(
  (
    err: Error & { status: number },
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    res.status(err.status || 500).send({
      message: err.message,
      stack: err.stack,
    });
  }
);

export default app;
