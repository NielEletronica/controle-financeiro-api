import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { Transacao, TransacaoDocument } from './schemas/transacao.schema';

export interface Metricas {
  saldoTotal: number;
  totalDespesas: number;
  totalGastoImpulso: number;
}

export interface ResumoFinanceiro {
  historico: Transacao[];
  metricas: Metricas;
}

const arredondar = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

@Injectable()
export class TransacoesService {
  constructor(
    @InjectModel(Transacao.name) private readonly transacaoModel: Model<TransacaoDocument>,
  ) {}

  create(dto: CreateTransacaoDto): Promise<TransacaoDocument> {
    return this.transacaoModel.create(dto);
  }

  async findAll(): Promise<ResumoFinanceiro> {
    const historico = await this.transacaoModel.find().sort({ createdAt: -1 }).lean().exec();
    return { historico: historico as unknown as Transacao[], metricas: this.calcularMetricas(historico as unknown as Transacao[]) };
  }

  calcularMetricas(transacoes: Transacao[]): Metricas {
    const totalReceitas = transacoes
      .filter((t) => t.tipo === 'receita')
      .reduce((acc, t) => acc + t.valor, 0);

    const despesas = transacoes.filter((t) => t.tipo === 'despesa');
    const totalDespesas = despesas.reduce((acc, t) => acc + t.valor, 0);

    const totalGastoImpulso = despesas
      .filter((t) => t.consumoConsciente === false)
      .reduce((acc, t) => acc + t.valor, 0);

    return {
      saldoTotal: arredondar(totalReceitas - totalDespesas),
      totalDespesas: arredondar(totalDespesas),
      totalGastoImpulso: arredondar(totalGastoImpulso),
    };
  }
}
