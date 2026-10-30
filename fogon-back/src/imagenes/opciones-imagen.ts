import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';

export const opcionesImagen: MulterOptions = {
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, archivo, cb) => {
    if (!/^image\/(jpeg|png|webp)$/.test(archivo.mimetype)) {
      return cb(new BadRequestException('La imagen debe ser JPG, PNG o WEBP'), false);
    }
    cb(null, true);
  },
};