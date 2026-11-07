import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import {
  NbButtonModule,
  NbCardModule,
  NbInputModule,
  NbSpinnerModule,
} from '@nebular/theme';

import { ConfiguracaoService } from '../../core/api.service';
import { Configuracao } from '../../core/models';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-configuracoes',
  imports: [ReactiveFormsModule, NbButtonModule, NbCardModule, NbInputModule, NbSpinnerModule],
  template: `
    @if (carregando()) {
      <div class="loading"><nb-spinner status="primary"></nb-spinner></div>
    } @else {
      <form [formGroup]="form" (ngSubmit)="salvar()">
        <nb-card>
          <nb-card-header>Empresa</nb-card-header>
          <nb-card-body>
            <div class="grid">
              <div class="campo">
                <label class="label">Nome</label>
                <input nbInput fullWidth formControlName="nomeEmpresa" />
              </div>
              <div class="campo">
                <label class="label">Telefone</label>
                <input nbInput fullWidth formControlName="fone" />
              </div>
              <div class="campo">
                <label class="label">Endereço</label>
                <input nbInput fullWidth formControlName="endereco" />
              </div>
              <div class="campo">
                <label class="label">E-mail</label>
                <input nbInput fullWidth formControlName="email" />
              </div>
            </div>
          </nb-card-body>
        </nb-card>

        <nb-card>
          <nb-card-header>Pátio</nb-card-header>
          <nb-card-body>
            <div class="campo" style="max-width: 220px">
              <label class="label">Capacidade máxima (vagas)</label>
              <input nbInput fullWidth type="number" min="1" max="999"
                     formControlName="capacidade" placeholder="18 (padrão)" />
            </div>
          </nb-card-body>
        </nb-card>

        <nb-card>
          <nb-card-header>Tabela de valores padrão (R$)</nb-card-header>
          <nb-card-body>
            <div class="grid precos">
              @for (campo of precos; track campo.nome) {
                <div class="campo">
                  <label class="label">{{ campo.rotulo }}</label>
                  <input nbInput fullWidth type="number" min="0" step="0.01"
                         [formControlName]="campo.nome" />
                </div>
              }
            </div>
          </nb-card-body>
        </nb-card>

        <nb-card>
          <nb-card-header>Mensagens de impressão</nb-card-header>
          <nb-card-body>
            <div class="campo">
              <label class="label">Cláusula</label>
              <textarea nbInput fullWidth rows="2" formControlName="clausula"></textarea>
            </div>
            <div class="grid">
              @for (i of [1, 2, 3]; track i) {
                <div class="campo">
                  <label class="label">Comentário {{ i }}</label>
                  <textarea nbInput fullWidth rows="2"
                            [formControlName]="'comentario' + i"></textarea>
                </div>
              }
            </div>
          </nb-card-body>
          <nb-card-footer class="footer">
            <button nbButton status="primary" [disabled]="salvando()" type="submit">
              Salvar configurações
            </button>
          </nb-card-footer>
        </nb-card>
      </form>
    }
  `,
  styles: `
    form { display: flex; flex-direction: column; gap: 1rem; }
    .loading { display: flex; justify-content: center; padding: 3rem; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; }
    .precos { grid-template-columns: repeat(4, 1fr); }
    .label { display: block; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.3rem; }
    .footer { display: flex; justify-content: flex-end; }
  `,
})
export class ConfiguracoesComponent {
  private readonly api = inject(ConfiguracaoService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly carregando = signal(true);
  readonly salvando = signal(false);

  readonly precos = [
    { nome: 'vrHora', rotulo: 'Hora' },
    { nome: 'vrDiaria', rotulo: 'Diária' },
    { nome: 'vrInterna', rotulo: 'Lav. interna' },
    { nome: 'vrExterna', rotulo: 'Lav. externa' },
    { nome: 'vrCompleta', rotulo: 'Lav. completa' },
    { nome: 'vrCera', rotulo: 'Cera' },
    { nome: 'vrMotor', rotulo: 'Motor' },
    { nome: 'vrTerceiro', rotulo: 'Serv. terceiro' },
  ] as const;

  readonly form = this.fb.group({
    nomeEmpresa: [''], endereco: [''], fone: [''], email: [''],
    clausula: [''], comentario1: [''], comentario2: [''], comentario3: [''],
    vrInterna: [null as number | null], vrExterna: [null as number | null],
    vrCompleta: [null as number | null], vrCera: [null as number | null],
    vrMotor: [null as number | null], vrHora: [null as number | null],
    vrDiaria: [null as number | null], vrTerceiro: [null as number | null],
    capacidade: [null as number | null],
  });

  constructor() {
    this.api.obter().subscribe({
      next: c => {
        this.form.patchValue(c);
        this.carregando.set(false);
      },
      error: e => {
        this.carregando.set(false);
        this.toast.erro(e);
      },
    });
  }

  salvar(): void {
    this.salvando.set(true);
    this.api.salvar(this.form.getRawValue() as Configuracao).subscribe({
      next: () => {
        this.salvando.set(false);
        this.toast.sucesso('Configurações salvas.');
      },
      error: e => {
        this.salvando.set(false);
        this.toast.erro(e);
      },
    });
  }
}
