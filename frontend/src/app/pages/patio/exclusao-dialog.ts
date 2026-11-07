import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  NbButtonModule,
  NbCardModule,
  NbDialogRef,
  NbInputModule,
} from '@nebular/theme';

import { ServicoService } from '../../core/api.service';
import { Servico } from '../../core/models';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-exclusao-dialog',
  imports: [ReactiveFormsModule, NbButtonModule, NbCardModule, NbInputModule],
  template: `
    <nb-card class="dialog">
      <nb-card-header>Excluir registro #{{ servico.entradaN }}</nb-card-header>
      <nb-card-body>
        <p>
          A exclusão de <strong>{{ servico.placa }}</strong> ({{ servico.veiculo }})
          será registrada no histórico e os recebimentos vinculados serão removidos.
        </p>
        <form [formGroup]="form">
          <label class="label">Justificativa *</label>
          <textarea nbInput fullWidth rows="3" formControlName="justificativa"
                    placeholder="Motivo da exclusão"></textarea>
        </form>
      </nb-card-body>
      <nb-card-footer class="footer">
        <button nbButton status="basic" (click)="ref.close(false)">Cancelar</button>
        <button nbButton status="danger" [disabled]="form.invalid || salvando()"
                (click)="salvar()">
          Excluir
        </button>
      </nb-card-footer>
    </nb-card>
  `,
  styles: `
    .dialog { width: min(480px, 92vw); }
    .label { display: block; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.3rem; }
    .footer { display: flex; justify-content: flex-end; gap: 0.6rem; }
  `,
})
export class ExclusaoDialogComponent {
  servico = {} as Servico;

  protected readonly ref = inject(NbDialogRef<ExclusaoDialogComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ServicoService);
  private readonly toast = inject(ToastService);

  readonly salvando = signal(false);
  readonly form = this.fb.nonNullable.group({
    justificativa: ['', Validators.required],
  });

  salvar(): void {
    if (this.form.invalid) return;
    this.salvando.set(true);
    this.api.excluir(this.servico.id, this.form.getRawValue().justificativa)
        .subscribe({
      next: () => this.ref.close(true),
      error: e => {
        this.salvando.set(false);
        this.toast.erro(e);
      },
    });
  }
}
