import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  NbButtonModule,
  NbCardModule,
  NbDialogRef,
  NbDialogService,
  NbIconModule,
  NbInputModule,
  NbSpinnerModule,
} from '@nebular/theme';

import { ClienteService } from '../../core/api.service';
import { Cliente, ClienteRequest } from '../../core/models';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-cliente-dialog',
  imports: [ReactiveFormsModule, NbButtonModule, NbCardModule, NbInputModule],
  template: `
    <nb-card class="dialog">
      <nb-card-header>{{ cliente ? 'Editar' : 'Novo' }} cliente</nb-card-header>
      <nb-card-body>
        <form [formGroup]="form" class="grid">
          <div class="campo">
            <label class="label">Nome</label>
            <input nbInput fullWidth formControlName="nome" />
          </div>
          <div class="campo">
            <label class="label">Nome fantasia *</label>
            <input nbInput fullWidth formControlName="nomeFantasia" />
          </div>
          <div class="campo">
            <label class="label">CNPJ/CPF</label>
            <input nbInput fullWidth formControlName="cgc" />
          </div>
          <div class="campo">
            <label class="label">Inscrição estadual</label>
            <input nbInput fullWidth formControlName="ie" />
          </div>
          <div class="campo span2">
            <label class="label">Endereço</label>
            <input nbInput fullWidth formControlName="endereco" />
          </div>
          <div class="campo">
            <label class="label">Bairro</label>
            <input nbInput fullWidth formControlName="bairro" />
          </div>
          <div class="campo">
            <label class="label">Cidade</label>
            <input nbInput fullWidth formControlName="cidade" />
          </div>
          <div class="campo">
            <label class="label">CEP</label>
            <input nbInput fullWidth formControlName="cep" />
          </div>
          <div class="campo">
            <label class="label">UF</label>
            <input nbInput fullWidth formControlName="uf" maxlength="2" />
          </div>
          <div class="campo">
            <label class="label">Telefone</label>
            <input nbInput fullWidth formControlName="fone" />
          </div>
          <div class="campo">
            <label class="label">Contato</label>
            <input nbInput fullWidth formControlName="contato" />
          </div>
          <div class="campo span2">
            <label class="label">E-mail</label>
            <input nbInput fullWidth type="email" formControlName="email" />
          </div>
        </form>
      </nb-card-body>
      <nb-card-footer class="footer">
        <button nbButton status="basic" (click)="ref.close(false)">Cancelar</button>
        <button nbButton status="primary" [disabled]="form.invalid || salvando()"
                (click)="salvar()">
          Salvar
        </button>
      </nb-card-footer>
    </nb-card>
  `,
  styles: `
    .dialog { width: min(640px, 94vw); }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; }
    .span2 { grid-column: span 2; }
    .label { display: block; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.3rem; }
    .footer { display: flex; justify-content: flex-end; gap: 0.6rem; }
  `,
})
export class ClienteDialogComponent {
  private _cliente: Cliente | null = null;

  set cliente(c: Cliente | null) {
    this._cliente = c;
    if (c) {
      this.form.patchValue(c);
    }
  }

  get cliente(): Cliente | null {
    return this._cliente;
  }

  protected readonly ref = inject(NbDialogRef<ClienteDialogComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ClienteService);
  private readonly toast = inject(ToastService);

  readonly salvando = signal(false);

  readonly form = this.fb.group({
    nome: [''], nomeFantasia: ['', Validators.required], cgc: [''], ie: [''],
    endereco: [''], bairro: [''], cidade: [''], cep: [''], uf: [''],
    fone: [''], contato: [''], email: [''],
  });

  salvar(): void {
    if (this.form.invalid) return;
    this.salvando.set(true);
    const request = { ...this.form.getRawValue(), foneFax: null } as ClienteRequest;
    const op = this._cliente
        ? this.api.atualizar(this._cliente.id, request)
        : this.api.criar(request);
    op.subscribe({
      next: () => this.ref.close(true),
      error: e => {
        this.salvando.set(false);
        this.toast.erro(e);
      },
    });
  }
}

@Component({
  selector: 'app-clientes',
  imports: [
    NbButtonModule, NbCardModule, NbIconModule, NbSpinnerModule,
  ],
  template: `
    <nb-card>
      <nb-card-header>
        <div class="header">
          <span>Clientes convênio</span>
          <button nbButton status="primary" (click)="editar(null)">
            <nb-icon icon="plus-outline"></nb-icon> Novo cliente
          </button>
        </div>
      </nb-card-header>
      <nb-card-body>
        @if (carregando()) {
          <div class="loading"><nb-spinner status="primary"></nb-spinner></div>
        } @else {
          <table class="table">
            <thead>
              <tr>
                <th>Nome fantasia</th><th>Nome</th><th>CNPJ/CPF</th>
                <th>Cidade/UF</th><th>Telefone</th><th></th>
              </tr>
            </thead>
            <tbody>
              @for (c of clientes(); track c.id) {
                <tr>
                  <td><strong>{{ c.nomeFantasia }}</strong></td>
                  <td>{{ c.nome ?? '—' }}</td>
                  <td>{{ c.cgc ?? '—' }}</td>
                  <td>{{ c.cidade ?? '—' }}{{ c.uf ? '/' + c.uf : '' }}</td>
                  <td>{{ c.fone ?? '—' }}</td>
                  <td class="acoes">
                    <button nbButton status="info" size="tiny" appearance="outline"
                            (click)="editar(c)">
                      <nb-icon icon="edit-outline"></nb-icon>
                    </button>
                    <button nbButton status="danger" size="tiny" appearance="outline"
                            (click)="excluir(c)">
                      <nb-icon icon="trash-2-outline"></nb-icon>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="vazio">Nenhum cliente cadastrado.</td></tr>
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
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #edf1f7; }
    .acoes { display: flex; gap: 0.4rem; justify-content: flex-end; }
  `,
})
export class ClientesComponent {
  private readonly api = inject(ClienteService);
  private readonly dialog = inject(NbDialogService);
  private readonly toast = inject(ToastService);

  readonly clientes = signal<Cliente[]>([]);
  readonly carregando = signal(false);

  constructor() {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.api.listar().subscribe({
      next: c => {
        this.clientes.set(c);
        this.carregando.set(false);
      },
      error: e => {
        this.carregando.set(false);
        this.toast.erro(e);
      },
    });
  }

  editar(cliente: Cliente | null): void {
    this.dialog.open(ClienteDialogComponent, { context: { cliente } })
        .onClose.subscribe(ok => {
      if (ok) {
        this.toast.sucesso('Cliente salvo.');
        this.carregar();
      }
    });
  }

  excluir(cliente: Cliente): void {
    if (!confirm(`Excluir o cliente "${cliente.nomeFantasia}"?`)) return;
    this.api.excluir(cliente.id).subscribe({
      next: () => {
        this.toast.sucesso('Cliente excluído.');
        this.carregar();
      },
      error: e => this.toast.erro(e),
    });
  }
}
