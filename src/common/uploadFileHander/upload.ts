import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { FILE_LIMITS, MinmeTypeFile } from "@/constant";
import fs from "fs";
const sanitizeFileName = (filename: string): string => {
  return filename.toLowerCase().replace(/[^a-z0-9]/g, "_");
};
const uploadDirectory = path.join(__dirname, "uploadFileLocal");

// Kiểm tra nếu thư mục chưa tồn tại, tạo thư mục
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}
// Cấu hình Multer
export const uploadFileMiddleware = (
  level: "free" | "plus" | "pro" = "free"
) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, "uploadFileLocal");
      cb(null, uploadPath);
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
