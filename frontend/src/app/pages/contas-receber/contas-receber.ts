import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  NbButtonModule,
  NbCardModule,
  NbSelectModule,
  NbSpinnerModule,
  NbTagModule,
} from '@nebular/theme';

import { FinanceiroService } from '../../core/api.service';
import { ContaReceber, FormaPagamento, SituacaoConta } from '../../core/models';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-contas-receber',
  imports: [
    CurrencyPipe, DatePipe, FormsModule, NbButtonModule, NbCardModule,
    NbSelectModule, NbSpinnerModule, NbTagModule,
  ],
  template: `
    <nb-card>
      <nb-card-header>
        <div class="header">
          <span>Contas a receber</span>
          <nb-select size="small" [(selected)]="situacao"
                     (selectedChange)="carregar()" placeholder="Todas">
            <nb-option value="">Todas</nb-option>
            <nb-option value="ABERTA">Abertas</nb-option>
            <nb-option value="PAGA">Pagas</nb-option>
          </nb-select>
        </div>
      </nb-card-header>
      <nb-card-body>
        @if (carregando()) {
          <div class="loading"><nb-spinner status="primary"></nb-spinner></div>
        } @else {
          <table class="table">
            <thead>
              <tr>
                <th>#</th><th>Data</th><th>Cliente</th><th>Entrada</th>
                <th>Placa</th><th>Veículo</th><th>Valor</th><th>Situação</th><th></th>
              </tr>
            </thead>
            <tbody>
              @for (c of contas(); track c.id) {
                <tr>
                  <td>{{ c.id }}</td>
                  <td>{{ c.data | date: 'dd/MM/yy HH:mm' }}</td>
                  <td>{{ c.clienteNomeFantasia ?? '—' }}</td>
                  <td>{{ c.entradaN }}</td>
                  <td><strong>{{ c.placa }}</strong></td>
                  <td>{{ c.veiculo }}</td>
                  <td>{{ c.valor | currency: 'BRL' }}</td>
                  <td>
                    <nb-tag size="tiny" [text]="c.situacao"
                            [status]="c.situacao === 'PAGA' ? 'success' : 'warning'">
                    </nb-tag>
                  </td>
                  <td>
                    @if (c.situacao === 'ABERTA') {
                      <div class="pagar">
                        <nb-select size="tiny" [(selected)]="formaPagamento">
                          <nb-option value="DINHEIRO">Dinheiro</nb-option>
                          <nb-option value="PIX">Pix</nb-option>
                          <nb-option value="CARTAO_CREDITO">Crédito</nb-option>
                          <nb-option value="CARTAO_DEBITO">Débito</nb-option>
                        </nb-select>
                        <button nbButton status="success" size="tiny" (click)="pagar(c)">
                          Pagar
                        </button>
                      </div>
                    } @else {
                      <span class="pago">
                        {{ c.dataHoraPagamento | date: 'dd/MM/yy HH:mm' }}
                      </span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="9" class="vazio">Nenhuma fatura.</td></tr>
              }
            </tbody>
          </table>
        }
      </nb-card-body>
    </nb-card>
  `,
  styles: `
    .header { display: flex; justify-content: space-between; align-items: center; width: 100%; }
    .loading { display: flex; justify-content: center; padding: 2rem; }
    .vazio { text-align: center; padding: 1.5rem; }
    .pago { font-size: 0.75rem; opacity: 0.7; }
    .pagar { display: flex; gap: 0.4rem; align-items: center; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #edf1f7; }
  `,
})
export class ContasReceberComponent {
  private readonly api = inject(FinanceiroService);
  private readonly toast = inject(ToastService);

  readonly contas = signal<ContaReceber[]>([]);
  readonly carregando = signal(false);
  situacao: SituacaoConta | '' = 'ABERTA';

  constructor() {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.api.contasReceber(this.situacao || undefined).subscribe({
      next: c => {
        this.contas.set(c);
        this.carregando.set(false);
      },
      error: e => {
        this.carregando.set(false);
        this.toast.erro(e);
      },
    });
  }

  formaPagamento: FormaPagamento = 'DINHEIRO';

  pagar(conta: ContaReceber): void {
    this.api.pagarConta(conta.id, this.formaPagamento).subscribe({
      next: () => {
        this.toast.sucesso(`Fatura #${conta.id} paga.`);
        this.carregar();
      },
      error: e => this.toast.erro(e),
    });
  }
}
