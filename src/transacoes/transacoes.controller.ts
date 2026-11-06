import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { TransacoesService } from './transacoes.service';

@Controller('transacoes')
export class TransacoesController {
  constructor(private readonly service: TransacoesService) {}

  @Post()
  create(@Body() dto: CreateTransacaoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
