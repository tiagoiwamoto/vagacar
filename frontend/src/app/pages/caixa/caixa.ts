import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  NbButtonModule,
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbSpinnerModule,
  NbTagModule,
} from '@nebular/theme';

import { FinanceiroService } from '../../core/api.service';
import { Recebimento, ResumoCaixa } from '../../core/models';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-caixa',
  imports: [
    CurrencyPipe, DatePipe, KeyValuePipe, FormsModule, NbButtonModule,
    NbCardModule, NbIconModule, NbInputModule, NbSpinnerModule, NbTagModule,
  ],
  template: `
    <nb-card>
      <nb-card-header>
        <div class="header">
          <span>Caixa</span>
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
        @if (resumo(); as r) {
          <div class="resumo">
            <nb-card class="kpi">
              <nb-card-body>
                <div class="kpi-label">Total do período</div>
                <div class="kpi-valor">{{ r.total | currency: 'BRL' }}</div>
                <div class="kpi-sub">{{ r.quantidade }} recebimento(s)</div>
              </nb-card-body>
            </nb-card>
            @for (item of r.porNatureza | keyvalue; track item.key) {
              <nb-card class="kpi">
                <nb-card-body>
                  <div class="kpi-label">{{ naturezaLabel(item.key) }}</div>
                  <div class="kpi-valor">{{ item.value | currency: 'BRL' }}</div>
                </nb-card-body>
              </nb-card>
            }
            @for (item of r.porFormaPagamento | keyvalue; track item.key) {
              <nb-card class="kpi forma">
                <nb-card-body>
                  <div class="kpi-label">{{ formaLabel(item.key) }}</div>
                  <div class="kpi-valor">{{ item.value | currency: 'BRL' }}</div>
                </nb-card-body>
              </nb-card>
            }
          </div>
        }

        @if (carregando()) {
          <div class="loading"><nb-spinner status="primary"></nb-spinner></div>
        } @else {
          <table class="table">
            <thead>
              <tr>
                <th>#</th><th>Data</th><th>Entrada</th><th>Cliente</th>
                <th>Natureza</th><th>Pagamento</th><th class="valor">Valor</th>
              </tr>
            </thead>
            <tbody>
              @for (rec of recebimentos(); track rec.id) {
                <tr>
                  <td>{{ rec.id }}</td>
                  <td>{{ rec.dataHora | date: 'dd/MM/yy HH:mm' }}</td>
                  <td>{{ rec.entradaN ?? '—' }}</td>
                  <td>{{ rec.cliente ?? '—' }}</td>
                  <td><nb-tag size="tiny" [text]="naturezaLabel(rec.natureza)"></nb-tag></td>
                  <td>{{ formaLabel(rec.formaPagamento) }}</td>
                  <td class="valor">{{ rec.valor | currency: 'BRL' }}</td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="vazio">Nenhum recebimento no período.</td></tr>
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
    .resumo { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
    .kpi { min-width: 180px; margin: 0; }
    .kpi.forma { outline: 2px solid #e4e9f2; }
    .kpi-label { font-size: 0.7rem; text-transform: uppercase; opacity: 0.7; }
    .kpi-valor { font-size: 1.4rem; font-weight: 700; }
    .kpi-sub { font-size: 0.75rem; opacity: 0.6; }
    .loading { display: flex; justify-content: center; padding: 2rem; }
    .vazio { text-align: center; padding: 1.5rem; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #edf1f7; }
    .valor { text-align: right; }
  `,
})
export class CaixaComponent {
  private readonly api = inject(FinanceiroService);
  private readonly toast = inject(ToastService);

  readonly recebimentos = signal<Recebimento[]>([]);
  readonly resumo = signal<ResumoCaixa | null>(null);
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
    const de = this.inicio || undefined;
    const ate = this.fim || undefined;
    this.api.resumoCaixa(de, ate).subscribe({
      next: r => this.resumo.set(r),
      error: e => this.toast.erro(e),
    });
    this.api.recebimentos(de, ate).subscribe({
      next: r => {
        this.recebimentos.set(r);
        this.carregando.set(false);
      },
      error: e => {
        this.carregando.set(false);
        this.toast.erro(e);
      },
    });
  }

  naturezaLabel(n: string): string {
    return {
      PARTICULAR: 'Particular',
      PRE_PAGO: 'Pré-pago',
      FATURA: 'Fatura',
    }[n] ?? n;
  }

  formaLabel(f: string | null | undefined): string {
    return {
      DINHEIRO: 'Dinheiro',
      CARTAO_CREDITO: 'Cartão crédito',
      CARTAO_DEBITO: 'Cartão débito',
      PIX: 'Pix',
    }[f ?? ''] ?? '—';
  }
}
