import { IsOptional, Matches } from 'class-validator';

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

export class RangoFechasDto {
  @IsOptional()
  @Matches(FORMATO_FECHA, { message: 'desde debe tener el formato AAAA-MM-DD' })
  desde?: string;

  @IsOptional()
  @Matches(FORMATO_FECHA, { message: 'hasta debe tener el formato AAAA-MM-DD' })
  hasta?: string;
}