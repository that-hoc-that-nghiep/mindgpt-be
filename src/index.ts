import express from "express";
import { Request, Response, NextFunction, Router } from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import httpErrors from "http-errors";

const app= express();

// Middleware configuration
app.use(express.json()); // Parse JSON payloads
app.use(bodyParser.json()); // Body-parser middleware
app.use(morgan("dev")); // Logger middleware
app.use(cors());

app.use(async (req, res, next) => {
  next(httpErrors.BadRequest("Bad request"));
});

// Root route
app.get("/", async (req: Request, res: Response) => {
  res.status(200).send({ message: "Welcome to Mindmap" });
});

app.use(async (req: Request, res: Response, next: NextFunction) => {
  next(httpErrors.BadRequest("Bad request"));
});

// Error handler
app.use((err: Error & { status: number }, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500).send({
    message: err.message,
    stack: err.stack,
  });
});

export default app;
