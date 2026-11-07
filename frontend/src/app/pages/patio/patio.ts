import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import {
  NbButtonModule,
  NbCardModule,
  NbDialogService,
  NbIconModule,
  NbSpinnerModule,
  NbTagModule,
} from '@nebular/theme';

import { ServicoService } from '../../core/api.service';
import {
  FechamentoResponse,
  FormaPagamento,
  Servico,
  VagaStatus,
} from '../../core/models';
import { PrintService } from '../../core/print.service';
import { ToastService } from '../../core/toast.service';
import { EntradaDialogComponent } from './entrada-dialog';
import { FechamentoDialogComponent } from './fechamento-dialog';
import { ExclusaoDialogComponent } from './exclusao-dialog';
import { MapaPatioComponent } from './mapa-patio';

@Component({
  selector: 'app-patio',
  imports: [
    DatePipe, NbButtonModule, NbCardModule, NbIconModule,
    NbSpinnerModule, NbTagModule, MapaPatioComponent,
  ],
  templateUrl: './patio.html',
  styleUrl: './patio.scss',
})
export class PatioComponent {
  private readonly api = inject(ServicoService);
  private readonly dialog = inject(NbDialogService);
  private readonly toast = inject(ToastService);
  private readonly print = inject(PrintService);

  readonly servicos = signal<Servico[]>([]);
  readonly vagas = signal<VagaStatus[]>([]);
  readonly carregando = signal(false);

  constructor() {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.api.listar(true).subscribe({
      next: s => {
        this.servicos.set(s);
        this.carregando.set(false);
      },
      error: e => {
        this.carregando.set(false);
        this.toast.erro(e);
      },
    });
    this.api.vagas().subscribe({
      next: v => this.vagas.set(v),
      error: () => {},
    });
  }

  novaEntrada(vaga?: string): void {
    this.dialog.open(EntradaDialogComponent, { context: { vagaInicial: vaga ?? null } })
        .onClose.subscribe((servico: Servico | undefined) => {
      if (servico) {
        this.toast.sucesso(`Entrada ${servico.entradaN} registrada.`);
        this.print.imprimirTicket(servico);
        this.carregar();
      }
    });
  }

  fechar(servico: Servico): void {
    this.dialog.open(FechamentoDialogComponent, { context: { servico } })
        .onClose.subscribe(
            (resultado: { resp: FechamentoResponse; forma: FormaPagamento } | undefined) => {
      if (resultado) {
        this.toast.sucesso(`Conta ${servico.entradaN} fechada.`);
        this.print.imprimirRecibo(resultado.resp, resultado.forma);
        this.carregar();
      }
    });
  }

  fecharPorVaga(vaga: VagaStatus): void {
    const s = this.servicos().find(x => x.id === vaga.servicoId);
    if (s) this.fechar(s);
  }

  excluir(servico: Servico): void {
    this.dialog.open(ExclusaoDialogComponent, { context: { servico } })
        .onClose.subscribe(ok => {
      if (ok) {
        this.toast.sucesso('Registro excluído com justificativa.');
        this.carregar();
      }
    });
  }

  tipoLabel(servico: Servico): string {
    return {
      PARTICULAR: 'Particular',
      PRE_PAGO: 'Pré-pago',
      CONVENIO: 'Convênio',
    }[servico.tipo];
  }

  tipoStatus(servico: Servico): string {
    return { PARTICULAR: 'info', PRE_PAGO: 'warning', CONVENIO: 'primary' }[servico.tipo];
  }
}
