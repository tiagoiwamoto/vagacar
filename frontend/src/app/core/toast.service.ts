import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NbToastrService } from '@nebular/theme';

import { ApiError } from './models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastr = inject(NbToastrService);

  sucesso(mensagem: string): void {
    this.toastr.success(mensagem, 'Sucesso');
  }

  erro(error: unknown): void {
    let mensagem = 'Erro ao comunicar com o servidor.';
    if (error instanceof HttpErrorResponse) {
      const api = error.error as ApiError;
      if (api?.mensagem) {
        mensagem = api.mensagem;
        if (api.violacoes?.length) {
          mensagem += ' ' + api.violacoes
              .map(v => `${v.campo}: ${v.mensagem}`).join('; ');
        }
      } else if (error.status === 0) {
        mensagem = 'Backend indisponivel. Verifique se a API esta rodando em :8080.';
      }
    }
    this.toastr.danger(mensagem, 'Erro');
  }
}
