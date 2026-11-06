import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TIPOS_TRANSACAO, TipoTransacao } from '../schemas/transacao.schema';

export class CreateTransacaoDto {
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsNumber()
  @Min(0)
  valor: number;

  @IsIn(TIPOS_TRANSACAO, { message: 'tipo deve ser "receita" ou "despesa"' })
  tipo: TipoTransacao;

  @IsString()
  @IsNotEmpty()
  categoria: string;

  @IsOptional()
  @IsBoolean()
  consumoConsciente?: boolean;
}
