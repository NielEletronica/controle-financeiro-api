import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TransacoesService } from '../src/transacoes/transacoes.service';
import { Transacao } from '../src/transacoes/schemas/transacao.schema';

describe('TransacoesService', () => {
  let service: TransacoesService;
  let findMock: jest.Mock;

  const dados: Transacao[] = [
    { descricao: 'Salário', valor: 3000, tipo: 'receita', categoria: 'Trabalho', consumoConsciente: true },
    { descricao: 'Conta de Luz', valor: 150.5, tipo: 'despesa', categoria: 'Moradia', consumoConsciente: true },
    { descricao: 'Compra de Roupas', valor: 300, tipo: 'despesa', categoria: 'Lazer', consumoConsciente: false },
    { descricao: 'Delivery', valor: 49.9, tipo: 'despesa', categoria: 'Alimentação', consumoConsciente: false },
  ];

  beforeEach(async () => {
    findMock = jest.fn().mockReturnValue({
      sort: () => ({ lean: () => ({ exec: () => Promise.resolve(dados) }) }),
    });
    const moduleRef = await Test.createTestingModule({
      providers: [
        TransacoesService,
        { provide: getModelToken(Transacao.name), useValue: { find: findMock, create: jest.fn() } },
      ],
    }).compile();
    service = moduleRef.get(TransacoesService);
  });

  it('calcula as métricas corretamente', () => {
    expect(service.calcularMetricas(dados)).toEqual({
      saldoTotal: 2499.6,
      totalDespesas: 500.4,
      totalGastoImpulso: 349.9,
    });
  });

  it('retorna historico e metricas no GET', async () => {
    const res = await service.findAll();
    expect(res.historico).toHaveLength(4);
    expect(res.metricas.saldoTotal).toBe(2499.6);
  });

  it('retorna zeros quando não há transações', () => {
    expect(service.calcularMetricas([])).toEqual({ saldoTotal: 0, totalDespesas: 0, totalGastoImpulso: 0 });
  });
});
