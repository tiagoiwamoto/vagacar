import { Injectable, inject } from '@angular/core';

import { ConfiguracaoService } from './api.service';
import { Configuracao, FechamentoResponse, FormaPagamento, Servico } from './models';

const FORMAS: Record<FormaPagamento, string> = {
  DINHEIRO: 'Dinheiro',
  CARTAO_CREDITO: 'Cartão Crédito',
  CARTAO_DEBITO: 'Cartão Débito',
  PIX: 'Pix',
};

const TIPOS: Record<string, string> = {
  PARTICULAR: 'Particular',
  PRE_PAGO: 'Pré-pago',
  CONVENIO: 'Convênio',
};

@Injectable({ providedIn: 'root' })
export class PrintService {
  private readonly configApi = inject(ConfiguracaoService);

  formaLabel(f: FormaPagamento | null | undefined): string {
    return f ? FORMAS[f] : '—';
  }

  imprimirTicket(servico: Servico): void {
    this.configApi.obter().subscribe(c => {
      this.abrirJanela(this.ticketHtml(servico, c));
    });
  }

  imprimirRecibo(resp: FechamentoResponse, forma: FormaPagamento | null): void {
    this.configApi.obter().subscribe(c => {
      this.abrirJanela(this.reciboHtml(resp, c, forma));
    });
  }

  private cabecalho(c: Configuracao): string {
    return `
      <div class="empresa">${c.nomeEmpresa ?? 'Estacionamento'}</div>
      <div class="sub">${c.endereco ?? ''} ${c.fone ? '· ' + c.fone : ''}</div>
      <hr/>`;
  }

  private estilo(): string {
    return `<style>
      body { font-family: monospace; width: 72mm; margin: 0; padding: 8px;
             font-size: 12px; color: #000; }
      .empresa { font-size: 16px; font-weight: bold; text-align: center; }
      .sub { text-align: center; font-size: 10px; }
      hr { border: none; border-top: 1px dashed #000; margin: 6px 0; }
      .titulo { text-align: center; font-weight: bold; margin: 6px 0; }
      .linha { display: flex; justify-content: space-between; }
      .placa { font-size: 20px; font-weight: bold; text-align: center;
               letter-spacing: 2px; margin: 6px 0; }
      .total { font-size: 16px; font-weight: bold; }
      .pequeno { font-size: 9px; margin-top: 8px; }
      .centro { text-align: center; }
    </style>`;
  }

  private fmt(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR') + ' ' +
        d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  private ticketHtml(s: Servico, c: Configuracao): string {
    return `${this.estilo()}
      ${this.cabecalho(c)}
      <div class="titulo">TICKET DE ENTRADA Nº ${s.entradaN}</div>
      <div class="placa">${s.placa}</div>
      <div class="linha"><span>Veículo:</span><span>${s.veiculo}</span></div>
      <div class="linha"><span>Tipo:</span><span>${TIPOS[s.tipo]}</span></div>
      <div class="linha"><span>Cobrança:</span>
        <span>${s.especie === 'HORA' ? 'Por hora' : 'Diária'}</span></div>
      ${s.vaga ? `<div class="linha"><span>Vaga:</span><span>${s.vaga}</span></div>` : ''}
      <div class="linha"><span>Entrada:</span><span>${this.fmt(s.dataHoraEntrada)}</span></div>
      ${s.vencimentoPrePago ? `<div class="linha"><span>Válido até:</span>
        <span>${this.fmt(s.vencimentoPrePago)}</span></div>` : ''}
      ${s.itens ? `<div class="linha"><span>Lavação:</span><span>${s.itens}</span></div>` : ''}
      ${s.tipo === 'PRE_PAGO' ? `<div class="linha total"><span>Pago:</span>
        <span>R$ ${this.money(s.total)}</span></div>` : ''}
      <hr/>
      <div class="pequeno">${c.clausula ?? ''}</div>
      <div class="centro pequeno">Guarde este ticket até a saída do veículo.</div>`;
  }

  private reciboHtml(r: FechamentoResponse, c: Configuracao,
      forma: FormaPagamento | null): string {
    const s = r.servico;
    const linha = (rot: string, val: string | number | null) =>
        val != null
            ? `<div class="linha"><span>${rot}:</span><span>${val}</span></div>` : '';
    const valor = (rot: string, val: number | null) =>
        val != null && val !== 0
            ? `<div class="linha"><span>${rot}:</span>
               <span>R$ ${this.money(val)}</span></div>` : '';
    const comp = r.servicoComplementar
        ? `<hr/><div class="titulo">Conta complementar (pré-pago vencido)</div>
           <div class="linha"><span>Nº:</span>
             <span>${r.servicoComplementar.entradaN}</span></div>
           <div class="linha"><span>Período:</span>
             <span>${this.fmt(r.servicoComplementar.dataHoraEntrada)} →
               ${this.fmt(r.servicoComplementar.dataHoraSaida)}</span></div>
           <div class="linha total"><span>Total complementar:</span>
             <span>R$ ${this.money(r.servicoComplementar.total)}</span></div>`
        : '';
    return `${this.estilo()}
      ${this.cabecalho(c)}
      <div class="titulo">RECIBO — CONTA Nº ${s.entradaN}</div>
      <div class="placa">${s.placa}</div>
      <div class="linha"><span>Veículo:</span><span>${s.veiculo}</span></div>
      ${linha('Tipo', TIPOS[s.tipo])}
      ${s.convenio ? linha('Convênio', s.convenio) : ''}
      <div class="linha"><span>Entrada:</span><span>${this.fmt(s.dataHoraEntrada)}</span></div>
      <div class="linha"><span>Saída:</span><span>${this.fmt(s.dataHoraSaida)}</span></div>
      ${s.qtdDias ? linha('Diárias', s.qtdDias) : ''}
      ${s.qtdHora ? linha('Horas', s.qtdHora) : ''}
      <hr/>
      ${valor('Estacionamento (hora)', s.vrHora)}
      ${valor('Estacionamento (diária)', s.vrDiaria)}
      ${valor('Lavação', s.vrItens)}
      ${valor('Cera', s.vrCera)}
      ${valor('Motor', s.vrMotor)}
      ${valor('Serviço terceiro', s.vrTerceiro)}
      <div class="linha"><span>Subtotal:</span><span>R$ ${this.money(s.subTotal)}</span></div>
      ${valor('Desconto', s.desconto)}
      <div class="linha total"><span>TOTAL:</span>
        <span>R$ ${this.money(s.total)}</span></div>
      ${s.tipo === 'CONVENIO'
          ? '<div class="centro">Faturado ao convênio</div>'
          : linha('Pagamento', this.formaLabel(forma))}
      ${comp}
      <hr/>
      <div class="pequeno">${c.comentario1 ?? ''}</div>
      <div class="centro pequeno">Obrigado pela preferência!</div>`;
  }

  private money(v: number | null): string {
    return (v ?? 0).toFixed(2).replace('.', ',');
  }

  private abrirJanela(conteudo: string): void {
    const win = window.open('', '_blank', 'width=400,height=600');
    if (!win) return;
    win.document.write(`<html><head><title>Estacionamento</title></head>
      <body>${conteudo}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }
}
