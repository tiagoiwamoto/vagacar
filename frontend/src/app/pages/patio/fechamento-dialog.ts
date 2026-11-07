import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import {
  NbButtonModule,
  NbCardModule,
  NbDialogRef,
  NbInputModule,
  NbSelectModule,
} from '@nebular/theme';

import { ServicoService } from '../../core/api.service';
import { FechamentoRequest, FormaPagamento, Servico } from '../../core/models';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-fechamento-dialog',
  imports: [DatePipe, ReactiveFormsModule, NbButtonModule, NbCardModule, NbInputModule, NbSelectModule],
  template: `
    <nb-card class="dialog">
      <nb-card-header>
        Fechar conta #{{ servico.entradaN }} — {{ servico.placa }}
      </nb-card-header>
      <nb-card-body>
        <dl class="resumo">
          <div><dt>Veículo</dt><dd>{{ servico.veiculo }}</dd></div>
          <div><dt>Tipo</dt><dd>{{ servico.tipo }}</dd></div>
          <div><dt>Entrada</dt>
            <dd>{{ servico.dataHoraEntrada | date: 'dd/MM/yyyy HH:mm' }}</dd></div>
          @if (servico.vencimentoPrePago) {
            <div><dt>Vencimento</dt>
              <dd>{{ servico.vencimentoPrePago | date: 'dd/MM/yyyy HH:mm' }}</dd></div>
          }
          @if (servico.tipo === 'PRE_PAGO') {
            <div><dt>Já pago</dt><dd>R$ {{ servico.total }}</dd></div>
          }
        </dl>

        <form [formGroup]="form">
          @if (servico.tipo !== 'CONVENIO') {
            <div class="campo">
              <label class="label">Forma de pagamento *</label>
              <nb-select fullWidth formControlName="formaPagamento">
                <nb-option value="DINHEIRO">Dinheiro</nb-option>
                <nb-option value="PIX">Pix</nb-option>
                <nb-option value="CARTAO_CREDITO">Cartão crédito</nb-option>
                <nb-option value="CARTAO_DEBITO">Cartão débito</nb-option>
              </nb-select>
            </div>
          } @else {
            <p class="hint">A conta será faturada ao convênio.</p>
          }

          @if (servico.tipo === 'PRE_PAGO') {
            <p class="hint">
              Se a saída passar do vencimento em mais de 10 minutos, uma conta
              complementar por hora será cobrada na forma acima.
            </p>
          }

          @if (servico.tipo !== 'PRE_PAGO') {
            <div class="grid">
              <div class="campo">
                <label class="label">Desconto (R$)</label>
                <input nbInput fullWidth type="number" min="0" step="0.01"
                       formControlName="desconto" />
              </div>
              <div class="campo">
                <label class="label">Valor hora (unid.)</label>
                <input nbInput fullWidth type="number" min="0" step="0.01"
                       formControlName="vrHoraUnit" placeholder="Padrão" />
              </div>
              <div class="campo">
                <label class="label">Valor diária (unid.)</label>
                <input nbInput fullWidth type="number" min="0" step="0.01"
                       formControlName="vrDiariaUnit" placeholder="Padrão" />
              </div>
              <div class="campo">
                <label class="label">Serviço terceiro (R$)</label>
                <input nbInput fullWidth type="number" min="0" step="0.01"
                       formControlName="vrTerceiro" />
              </div>
            </div>
            <p class="hint">
              Campos de valor vazios usam os valores cadastrados.
            </p>
          }
        </form>
      </nb-card-body>
      <nb-card-footer class="footer">
        <button nbButton status="basic" (click)="ref.close(false)">Cancelar</button>
        <button nbButton status="success" [disabled]="salvando() || !formaOk()"
                (click)="salvar()">
          Confirmar fechamento
        </button>
      </nb-card-footer>
    </nb-card>
  `,
  styles: `
    .dialog { width: min(520px, 92vw); }
    .resumo { display: flex; gap: 2rem; flex-wrap: wrap; margin: 0 0 1rem; }
    .resumo dt { font-size: 0.7rem; text-transform: uppercase; opacity: 0.7; }
    .resumo dd { margin: 0; font-weight: 600; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; }
    .label { display: block; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.3rem; }
    .hint { font-size: 0.8rem; opacity: 0.7; margin-top: 0.8rem; }
    .footer { display: flex; justify-content: flex-end; gap: 0.6rem; }
  `,
})
export class FechamentoDialogComponent {
  servico = {} as Servico;

  protected readonly ref = inject(NbDialogRef<FechamentoDialogComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ServicoService);
  private readonly toast = inject(ToastService);

  readonly salvando = signal(false);

  readonly form = this.fb.group({
    formaPagamento: [null as FormaPagamento | null],
    desconto: [null as number | null],
    vrHoraUnit: [null as number | null],
    vrDiariaUnit: [null as number | null],
    vrTerceiro: [null as number | null],
  });

  formaOk(): boolean {
    return this.servico.tipo === 'CONVENIO'
        || this.form.value.formaPagamento != null;
  }

  salvar(): void {
    if (!this.formaOk()) return;
    this.salvando.set(true);
    const v = this.form.getRawValue();
    const request: FechamentoRequest = {
      formaPagamento: v.formaPagamento,
      ...(this.servico.tipo === 'PRE_PAGO' ? {} : {
        desconto: v.desconto,
        vrHoraUnit: v.vrHoraUnit,
        vrDiariaUnit: v.vrDiariaUnit,
        vrTerceiro: v.vrTerceiro,
      }),
    };
    this.api.fechar(this.servico.id, request).subscribe({
      next: resp => this.ref.close({ resp, forma: v.formaPagamento }),
      error: e => {
        this.salvando.set(false);
        this.toast.erro(e);
      },
    });
  }
}
