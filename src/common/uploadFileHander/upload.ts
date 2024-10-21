import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { FILE_LIMITS, MinmeTypeFile } from "@/constant";

const sanitizeFileName = (filename: string): string => {
  return filename.toLowerCase().replace(/[^a-z0-9]/g, "_");
};

// Cấu hình Multer
export const uploadFileMiddleware = (
  level: "free" | "plus" | "pro" = "free"
) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploadFileLocal/");
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const sanitizedFileName = sanitizeFileName(
        path.basename(file.originalname, ext)
      ); // Xử lý tên file
      cb(null, `${sanitizedFileName}_${uuidv4()}${ext}`);
    },
  });

  const fileFilter = (
    req: express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    if (file.mimetype === MinmeTypeFile.PDF) {
      cb(null, true); // Chấp nhận file PDF
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  };

  return multer({
    storage: storage,
    limits: { fileSize: FILE_LIMITS[level] },
    fileFilter: fileFilter,
  });
};
