import express from "express";
import { mindmapController } from "@/controller/mindmapController";

export const mindmapRouter = express.Router();

mindmapRouter.post("/create", mindmapController.createMindmap);
