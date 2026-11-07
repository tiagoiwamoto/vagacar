import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  NbButtonModule,
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbSpinnerModule,
  NbTagModule,
} from '@nebular/theme';

import { ServicoService } from '../../core/api.service';
import { Servico } from '../../core/models';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-servicos',
  imports: [
    CurrencyPipe, DatePipe, FormsModule, NbButtonModule, NbCardModule,
    NbIconModule, NbInputModule, NbSpinnerModule, NbTagModule,
  ],
  template: `
    <nb-card>
      <nb-card-header>
        <div class="header">
          <span>Serviços</span>
          <div class="filtros">
            <input nbInput type="date" size="small" [(ngModel)]="inicio" />
            <input nbInput type="date" size="small" [(ngModel)]="fim" />
            <button nbButton status="primary" size="small" (click)="carregar()">
              <nb-icon icon="search-outline"></nb-icon> Filtrar
            </button>
          </div>
        </div>
      </nb-card-header>
      <nb-card-body>
        @if (carregando()) {
          <div class="loading"><nb-spinner status="primary"></nb-spinner></div>
        } @else {
          <table class="table">
            <thead>
              <tr>
                <th>Nº</th><th>Placa</th><th>Veículo</th><th>Tipo</th>
                <th>Entrada</th><th>Saída</th><th>Qtd.</th><th>Subtotal</th>
                <th>Desc.</th><th>Total</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (s of servicos(); track s.id) {
                <tr>
                  <td>{{ s.entradaN }}</td>
                  <td><strong>{{ s.placa }}</strong></td>
                  <td>{{ s.veiculo }}</td>
                  <td>{{ s.tipo }}</td>
                  <td>{{ s.dataHoraEntrada | date: 'dd/MM/yy HH:mm' }}</td>
                  <td>
                    {{ s.dataHoraSaida ? (s.dataHoraSaida | date: 'dd/MM/yy HH:mm') : '—' }}
                  </td>
                  <td>{{ quantidade(s) }}</td>
                  <td>{{ s.subTotal | currency: 'BRL' }}</td>
                  <td>{{ s.desconto | currency: 'BRL' }}</td>
                  <td><strong>{{ s.total | currency: 'BRL' }}</strong></td>
                  <td>
                    <nb-tag size="tiny"
                            [text]="s.aberto ? 'Aberta' : 'Fechada'"
                            [status]="s.aberto ? 'warning' : 'success'">
                    </nb-tag>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="11" class="vazio">Nenhum registro no período.</td></tr>
              }
            </tbody>
          </table>
        }
      </nb-card-body>
    </nb-card>
  `,
  styles: `
    .header { display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 0.5rem; }
    .filtros { display: flex; gap: 0.5rem; align-items: center; }
    .loading { display: flex; justify-content: center; padding: 2rem; }
    .vazio { text-align: center; padding: 1.5rem; }
    .table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    .table th, .table td { text-align: left; padding: 0.45rem; border-bottom: 1px solid #edf1f7; white-space: nowrap; }
  `,
})
export class ServicosComponent {
  private readonly api = inject(ServicoService);
  private readonly toast = inject(ToastService);

  readonly servicos = signal<Servico[]>([]);
  readonly carregando = signal(false);
  inicio = '';
  fim = '';

  constructor() {
    const hoje = new Date().toISOString().slice(0, 10);
    this.inicio = hoje;
    this.fim = hoje;
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.api.listar(undefined, this.inicio || undefined, this.fim || undefined)
        .subscribe({
      next: s => {
        this.servicos.set(s);
        this.carregando.set(false);
      },
      error: e => {
        this.carregando.set(false);
        this.toast.erro(e);
      },
    });
  }

  quantidade(s: Servico): string {
    const partes: string[] = [];
    if (s.qtdDias) partes.push(`${s.qtdDias}d`);
    if (s.qtdHora) partes.push(`${s.qtdHora}h`);
    return partes.join(' ') || '—';
  }
}
