import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbDialogRef,
  NbInputModule,
  NbSelectModule,
} from '@nebular/theme';

import { ClienteService, ServicoService } from '../../core/api.service';
import { VeiculoItem, VeiculoService } from '../../core/veiculo.service';
import {
  Cliente,
  EntradaRequest,
  FormaPagamento,
} from '../../core/models';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-entrada-dialog',
  imports: [
    ReactiveFormsModule, NbButtonModule, NbCardModule, NbCheckboxModule,
    NbInputModule, NbSelectModule,
  ],
  template: `
    <nb-card class="dialog">
      <nb-card-header>Nova entrada</nb-card-header>
      <nb-card-body>
        <form [formGroup]="form" class="grid">
          <div class="campo">
            <label class="label">Placa *</label>
            <input nbInput fullWidth formControlName="placa"
                   placeholder="ABC1D23" maxlength="10" />
          </div>
          <div class="campo">
            <label class="label">Marca *</label>
            <input nbInput fullWidth formControlName="marcaNome"
                   list="dl-marcas" placeholder="Ex.: Fiat"
                   (change)="aoMudarMarca()" (blur)="aoMudarMarca()" />
            <datalist id="dl-marcas">
              @for (m of marcasItems(); track m.codigo) {
                <option [value]="m.nome"></option>
              }
            </datalist>
          </div>
          <div class="campo">
            <label class="label">Modelo *</label>
            <input nbInput fullWidth formControlName="modeloNome"
                   list="dl-modelos" placeholder="Ex.: Argo Drive" />
            <datalist id="dl-modelos">
              @for (m of modelosItems(); track m.codigo) {
                <option [value]="m.nome"></option>
              }
            </datalist>
          </div>
          <div class="campo">
            <label class="label">Tipo</label>
            <nb-select fullWidth formControlName="tipo">
              <nb-option value="PARTICULAR">Particular</nb-option>
              <nb-option value="PRE_PAGO">Pré-pago</nb-option>
              <nb-option value="CONVENIO">Convênio</nb-option>
            </nb-select>
          </div>
          <div class="campo">
            <label class="label">Cobrança</label>
            <nb-select fullWidth formControlName="especie">
              <nb-option value="HORA">Por hora</nb-option>
              <nb-option value="DIARIA">Diária</nb-option>
            </nb-select>
          </div>

          @if (form.value.tipo === 'CONVENIO') {
            <div class="campo span2">
              <label class="label">Cliente convênio *</label>
              <nb-select fullWidth formControlName="clienteId">
                @for (c of clientes(); track c.id) {
                  <nb-option [value]="c.id">{{ c.nomeFantasia }}</nb-option>
                }
              </nb-select>
            </div>
          }

          @if (form.value.tipo === 'PRE_PAGO') {
            <div class="campo">
              <label class="label">
                {{ form.value.especie === 'DIARIA' ? 'Qtd. dias *' : 'Qtd. horas *' }}
              </label>
              <input nbInput fullWidth type="number" min="1"
                     [formControlName]="form.value.especie === 'DIARIA'
                        ? 'qtdDias' : 'qtdHora'" />
            </div>
            <div class="campo">
              <label class="label">Forma de pagamento *</label>
              <nb-select fullWidth formControlName="formaPagamento">
                <nb-option value="DINHEIRO">Dinheiro</nb-option>
                <nb-option value="PIX">Pix</nb-option>
                <nb-option value="CARTAO_CREDITO">Cartão crédito</nb-option>
                <nb-option value="CARTAO_DEBITO">Cartão débito</nb-option>
              </nb-select>
            </div>
          }

          <div class="campo">
            <label class="label">Vaga</label>
            <nb-select fullWidth formControlName="vaga">
              <nb-option [value]="null">Automática</nb-option>
              @for (v of vagasLivres(); track v) {
                <nb-option [value]="v">{{ v }}</nb-option>
              }
            </nb-select>
          </div>

          <div class="campo">
            <label class="label">Lavação</label>
            <nb-select fullWidth formControlName="itens">
              <nb-option [value]="null">Nenhuma</nb-option>
              <nb-option value="INTERNA">Interna</nb-option>
              <nb-option value="EXTERNA">Externa</nb-option>
              <nb-option value="COMPLETA">Completa</nb-option>
            </nb-select>
          </div>

          <div class="campo checks">
            <nb-checkbox formControlName="comCera">Cera</nb-checkbox>
            <nb-checkbox formControlName="comMotor">Motor</nb-checkbox>
          </div>

          <div class="campo">
            <label class="label">Serviço terceiro (R$)</label>
            <input nbInput fullWidth type="number" min="0" step="0.01"
                   formControlName="vrTerceiro" />
          </div>
          <div class="campo">
            <label class="label">Complemento</label>
            <input nbInput fullWidth formControlName="complemento" />
          </div>
        </form>
      </nb-card-body>
      <nb-card-footer class="footer">
        <button nbButton status="basic" (click)="ref.close(false)">Cancelar</button>
        <button nbButton status="primary" [disabled]="form.invalid || salvando()"
                (click)="salvar()">
          Registrar entrada
        </button>
      </nb-card-footer>
    </nb-card>
  `,
  styles: `
    .dialog { width: min(560px, 92vw); }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; }
    .span2 { grid-column: span 2; }
    .checks { display: flex; gap: 1rem; align-items: flex-end; }
    .label { display: block; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.3rem; }
    .footer { display: flex; justify-content: flex-end; gap: 0.6rem; }
  `,
})
export class EntradaDialogComponent {
  set vagaInicial(v: string | null) {
    if (v) this.form.patchValue({ vaga: v });
  }

  protected readonly ref = inject(NbDialogRef<EntradaDialogComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ServicoService);
  private readonly clienteApi = inject(ClienteService);
  private readonly veiculoApi = inject(VeiculoService);
  private readonly toast = inject(ToastService);

  readonly clientes = signal<Cliente[]>([]);
  readonly vagasLivres = signal<string[]>([]);
  readonly marcasItems = signal<VeiculoItem[]>([]);
  readonly modelosItems = signal<VeiculoItem[]>([]);
  readonly salvando = signal(false);

  readonly form = this.fb.nonNullable.group({
    placa: ['', Validators.required],
    marcaNome: ['', Validators.required],
    modeloNome: ['', Validators.required],
    tipo: this.fb.nonNullable.control<'PARTICULAR' | 'PRE_PAGO' | 'CONVENIO'>(
        'PARTICULAR'),
    especie: this.fb.nonNullable.control<'HORA' | 'DIARIA'>('HORA'),
    clienteId: [null as number | null],
    itens: [null as 'INTERNA' | 'EXTERNA' | 'COMPLETA' | null],
    comCera: [false],
    comMotor: [false],
    vrTerceiro: [null as number | null],
    complemento: [''],
    qtdHora: [null as number | null],
    qtdDias: [null as number | null],
    vaga: [null as string | null],
    formaPagamento: [null as FormaPagamento | null],
  });

  constructor() {
    this.clienteApi.listar().subscribe({
      next: c => this.clientes.set(c),
      error: () => {},
    });
    this.veiculoApi.marcas().subscribe({
      next: m => this.marcasItems.set(m),
      error: () => {},
    });
    this.api.vagas().subscribe({
      next: vagas => this.vagasLivres.set(
          vagas.filter(v => !v.ocupada).map(v => v.codigo)),
      error: () => {},
    });
  }

  aoMudarMarca(): void {
    const nome = this.form.value.marcaNome?.trim().toLowerCase();
    const marca = this.marcasItems()
        .find(m => m.nome.trim().toLowerCase() === nome);
    if (marca) {
      this.veiculoApi.modelos(marca.codigo).subscribe({
        next: ms => this.modelosItems.set(ms),
        error: () => {},
      });
    }
  }

  salvar(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    if (v.tipo === 'PRE_PAGO' && !v.formaPagamento) {
      this.toast.erro(null);
      return;
    }
    const request: EntradaRequest = {
      placa: v.placa.toUpperCase(),
      veiculo: `${v.marcaNome} ${v.modeloNome}`.trim(),
      tipo: v.tipo,
      especie: v.especie,
      clienteId: v.tipo === 'CONVENIO' ? v.clienteId : null,
      itens: v.itens,
      comCera: v.comCera,
      comMotor: v.comMotor,
      vrTerceiro: v.vrTerceiro,
      complemento: v.complemento || null,
      qtdHora: v.tipo === 'PRE_PAGO' && v.especie === 'HORA' ? v.qtdHora : null,
      qtdDias: v.tipo === 'PRE_PAGO' && v.especie === 'DIARIA' ? v.qtdDias : null,
      vaga: v.vaga,
      formaPagamento: v.tipo === 'PRE_PAGO' ? v.formaPagamento : null,
    };
    this.salvando.set(true);
    this.api.registrarEntrada(request).subscribe({
      next: servico => this.ref.close(servico),
      error: e => {
        this.salvando.set(false);
        this.toast.erro(e);
      },
    });
  }
}
