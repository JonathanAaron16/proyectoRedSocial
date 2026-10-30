import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class ImagenesService {
  constructor(config: ConfigService) {
    cloudinary.config({
      cloud_name: config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: config.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  // Sube el archivo y devuelve la URL pública
  subir(archivo: Express.Multer.File, carpeta: string): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: `fogon/${carpeta}` }, (error, resultado) => {
          if (error || !resultado) {
            return reject(new InternalServerErrorException('No se pudo subir la imagen'));
          }
          resolve(resultado.secure_url);
        })
        .end(archivo.buffer);
    });
  }
}