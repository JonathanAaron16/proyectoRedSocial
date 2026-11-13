import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { ImagenesModule } from '../imagenes/imagenes.module.js';
import { DURACION_SESION_SEGUNDOS } from './constantes.js';

@Module({
  imports: [
    UsuariosModule,
    ImagenesModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: DURACION_SESION_SEGUNDOS }, // 15 minutos, en segundos
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}