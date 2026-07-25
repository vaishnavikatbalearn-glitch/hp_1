import fs from 'fs';
import path from 'path';
import multer, { FileFilterCallback } from 'multer';
import type { Request } from 'express';

const uploadRoot = path.resolve(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(uploadRoot, { recursive: true });
    cb(null, uploadRoot);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.bin';
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimeTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']);

  if (allowedMimeTypes.has(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error('Unsupported file type'));
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});

export function persistUploadedFile(file: Express.Multer.File, destinationDir: string, fileName?: string): string {
  const safeFileName = (fileName ?? `${Date.now()}-${path.basename(file.originalname || file.filename)}`)
    .replace(/[^a-zA-Z0-9._-]/g, '_');
  const destinationPath = path.resolve(uploadRoot, destinationDir, safeFileName);

  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.copyFileSync(file.path, destinationPath);

  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }

  return destinationPath;
}

export function getUploadPublicUrl(filePath: string): string {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const uploadsSuffix = normalizedPath.split('/uploads/').pop() ?? normalizedPath;
  return `/uploads/${uploadsSuffix}`;
}
