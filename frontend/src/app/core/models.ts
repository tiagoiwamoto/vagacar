export type TipoServico = 'PARTICULAR' | 'PRE_PAGO' | 'CONVENIO';
export type EspecieCobranca = 'HORA' | 'DIARIA';
export type TipoLavacao = 'INTERNA' | 'EXTERNA' | 'COMPLETA';
export type NaturezaRecebimento = 'PARTICULAR' | 'PRE_PAGO' | 'FATURA';
export type SituacaoConta = 'ABERTA' | 'PAGA';
export type FormaPagamento =
    'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX';

export interface VagaStatus {
  codigo: string;
  ocupada: boolean;
  servicoId: number | null;
  placa: string | null;
  veiculo: string | null;
  tipo: TipoServico | null;
}

export interface Servico {
  id: number;
  entradaN: number;
  placa: string;
  veiculo: string;
  tipo: TipoServico;
  especie: EspecieCobranca;
  dataHoraEntrada: string;
  dataHoraSaida: string | null;
  aberto: boolean;
  qtdHora: number | null;
  qtdDias: number | null;
  vrHora: number | null;
  vrDiaria: number | null;
  vrItens: number | null;
  vrCera: number | null;
  vrMotor: number | null;
  vrTerceiro: number | null;
  subTotal: number | null;
  desconto: number | null;
  total: number | null;
  itens: TipoLavacao | null;
  complemento: string | null;
  clienteId: number | null;
  convenio: string | null;
  vencimentoPrePago: string | null;
  vaga: string | null;
}

export interface EntradaRequest {
  placa: string;
  veiculo: string;
  tipo: TipoServico;
  especie: EspecieCobranca;
  clienteId?: number | null;
  itens?: TipoLavacao | null;
  vrItens?: number | null;
  comCera?: boolean;
  vrCera?: number | null;
  comMotor?: boolean;
  vrMotor?: number | null;
  vrTerceiro?: number | null;
  complemento?: string | null;
  qtdHora?: number | null;
  qtdDias?: number | null;
  vrHoraUnit?: number | null;
  vrDiariaUnit?: number | null;
  vaga?: string | null;
  formaPagamento?: FormaPagamento | null;
}

export interface FechamentoRequest {
  dataHoraSaida?: string | null;
  desconto?: number | null;
  vrHoraUnit?: number | null;
  vrDiariaUnit?: number | null;
  vrItens?: number | null;
  vrCera?: number | null;
  vrMotor?: number | null;
  vrTerceiro?: number | null;
  formaPagamento?: FormaPagamento | null;
}

export interface FechamentoResponse {
  servico: Servico;
  servicoComplementar: Servico | null;
}

export interface Cliente {
  id: number;
  nome: string | null;
  nomeFantasia: string;
  cgc: string | null;
  ie: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  cep: string | null;
  uf: string | null;
  fone: string | null;
  foneFax: string | null;
  contato: string | null;
  email: string | null;
  dataCadastro: string | null;
}

export type ClienteRequest = Omit<Cliente, 'id' | 'dataCadastro'>;

export interface Configuracao {
  nomeEmpresa: string | null;
  endereco: string | null;
  fone: string | null;
  email: string | null;
  clausula: string | null;
  comentario1: string | null;
  comentario2: string | null;
  comentario3: string | null;
  vrInterna: number | null;
  vrExterna: number | null;
  vrCompleta: number | null;
  vrCera: number | null;
  vrMotor: number | null;
  vrHora: number | null;
  vrDiaria: number | null;
  vrTerceiro: number | null;
  capacidade: number | null;
}

export interface Recebimento {
  id: number;
  entradaN: number | null;
  dataHora: string;
  cliente: string | null;
  natureza: NaturezaRecebimento;
  formaPagamento: FormaPagamento | null;
  valor: number;
}

export interface ContaReceber {
  id: number;
  data: string;
  situacao: SituacaoConta;
  clienteId: number | null;
  clienteNomeFantasia: string | null;
  entradaN: number | null;
  placa: string | null;
  veiculo: string | null;
  dataHoraEntrada: string | null;
  dataHoraSaida: string | null;
  valor: number;
  dataHoraPagamento: string | null;
}

export interface Exclusao {
  id: number;
  dataHoraExclusao: string;
  justificativa: string;
  valor: number | null;
  veiculo: string | null;
  placa: string | null;
}

export interface ResumoCaixa {
  total: number;
  quantidade: number;
  porNatureza: Record<string, number>;
  porFormaPagamento: Record<string, number>;
}

export interface ApiError {
  instante: string;
  status: number;
  mensagem: string;
  caminho: string;
  violacoes: { campo: string; mensagem: string }[];
}
