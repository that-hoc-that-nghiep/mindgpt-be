import express from "express";
import { Request, Response, NextFunction, Router } from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import httpErrors from "http-errors";
import { mindmapRouter } from "@/router/mindmapRouter";

const app = express();

//Set trust proxy
app.set("trust proxy", true);

// Middleware configuration
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Body-parser middleware
app.use(morgan("dev")); // Logger middleware

app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Custom-Header'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Root route
app.get("/", async (req: Request, res: Response) => {
  res.status(200).send({ message: "Welcome to Mindmap-GPT" });
});

// Routes
app.use("/mindmap", mindmapRouter);

app.use(async (req: Request, res: Response, next: NextFunction) => {
  next(httpErrors.BadRequest("Bad request"));
});

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
