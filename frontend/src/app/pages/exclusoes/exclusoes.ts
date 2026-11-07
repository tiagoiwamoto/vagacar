import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { NbCardModule, NbSpinnerModule } from '@nebular/theme';

import { ExclusaoService } from '../../core/api.service';
import { Exclusao } from '../../core/models';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-exclusoes',
  imports: [CurrencyPipe, DatePipe, NbCardModule, NbSpinnerModule],
  template: `
    <nb-card>
      <nb-card-header>Histórico de exclusões</nb-card-header>
      <nb-card-body>
        @if (carregando()) {
          <div class="loading"><nb-spinner status="primary"></nb-spinner></div>
        } @else {
          <table class="table">
            <thead>
              <tr>
                <th>#</th><th>Data</th><th>Placa</th><th>Veículo</th>
                <th>Valor</th><th>Justificativa</th>
              </tr>
            </thead>
            <tbody>
              @for (e of exclusoes(); track e.id) {
                <tr>
                  <td>{{ e.id }}</td>
                  <td>{{ e.dataHoraExclusao | date: 'dd/MM/yy HH:mm' }}</td>
                  <td><strong>{{ e.placa }}</strong></td>
                  <td>{{ e.veiculo ?? '—' }}</td>
                  <td>{{ e.valor | currency: 'BRL' }}</td>
                  <td>{{ e.justificativa }}</td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="vazio">Nenhuma exclusão registrada.</td></tr>
              }
            </tbody>
          </table>
        }
      </nb-card-body>
    </nb-card>
  `,
  styles: `
    .loading { display: flex; justify-content: center; padding: 2rem; }
    .vazio { text-align: center; padding: 1.5rem; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #edf1f7; }
  `,
})
export class ExclusoesComponent {
  private readonly api = inject(ExclusaoService);
  private readonly toast = inject(ToastService);

  readonly exclusoes = signal<Exclusao[]>([]);
  readonly carregando = signal(false);

  constructor() {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.api.listar().subscribe({
      next: e => {
        this.exclusoes.set(e);
        this.carregando.set(false);
      },
      error: e => {
        this.carregando.set(false);
        this.toast.erro(e);
      },
    });
  }
}
