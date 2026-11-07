import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  Cliente,
  ClienteRequest,
  Configuracao,
  ContaReceber,
  EntradaRequest,
  Exclusao,
  FechamentoRequest,
  FechamentoResponse,
  FormaPagamento,
  Recebimento,
  ResumoCaixa,
  Servico,
  SituacaoConta,
  VagaStatus,
} from './models';

@Injectable({ providedIn: 'root' })
export class ServicoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/servicos`;

  listar(abertos?: boolean, inicio?: string, fim?: string): Observable<Servico[]> {
    let params = new HttpParams();
    if (abertos != null) params = params.set('abertos', abertos);
    if (inicio) params = params.set('inicio', `${inicio}T00:00:00`);
    if (fim) params = params.set('fim', `${fim}T23:59:59`);
    return this.http.get<Servico[]>(this.base, { params });
  }

  buscar(id: number): Observable<Servico> {
    return this.http.get<Servico>(`${this.base}/${id}`);
  }

  registrarEntrada(request: EntradaRequest): Observable<Servico> {
    return this.http.post<Servico>(this.base, request);
  }

  fechar(id: number, request: FechamentoRequest): Observable<FechamentoResponse> {
    return this.http.post<FechamentoResponse>(`${this.base}/${id}/fechamento`, request);
  }

  excluir(id: number, justificativa: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`, { body: { justificativa } });
  }

  vagas(): Observable<VagaStatus[]> {
    return this.http.get<VagaStatus[]>(`${this.base}/vagas/mapa`);
  }
}

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/clientes`;

  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.base);
  }

  criar(request: ClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.base, request);
  }

  atualizar(id: number, request: ClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.base}/${id}`, request);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class ConfiguracaoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/configuracao`;

  obter(): Observable<Configuracao> {
    return this.http.get<Configuracao>(this.base);
  }

  salvar(config: Configuracao): Observable<Configuracao> {
    return this.http.put<Configuracao>(this.base, config);
  }
}

@Injectable({ providedIn: 'root' })
export class FinanceiroService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  recebimentos(inicio?: string, fim?: string): Observable<Recebimento[]> {
    let params = new HttpParams();
    if (inicio) params = params.set('inicio', `${inicio}T00:00:00`);
    if (fim) params = params.set('fim', `${fim}T23:59:59`);
    return this.http.get<Recebimento[]>(`${this.base}/recebimentos`, { params });
  }

  resumoCaixa(inicio?: string, fim?: string): Observable<ResumoCaixa> {
    let params = new HttpParams();
    if (inicio) params = params.set('inicio', inicio);
    if (fim) params = params.set('fim', fim);
    return this.http.get<ResumoCaixa>(`${this.base}/caixa/resumo`, { params });
  }

  contasReceber(situacao?: SituacaoConta): Observable<ContaReceber[]> {
    let params = new HttpParams();
    if (situacao) params = params.set('situacao', situacao);
    return this.http.get<ContaReceber[]>(`${this.base}/contas-receber`, { params });
  }

  pagarConta(id: number, formaPagamento: FormaPagamento): Observable<ContaReceber> {
    return this.http.post<ContaReceber>(
        `${this.base}/contas-receber/${id}/pagamento`, { formaPagamento });
  }
}

@Injectable({ providedIn: 'root' })
export class ExclusaoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/exclusoes`;

  listar(): Observable<Exclusao[]> {
    return this.http.get<Exclusao[]>(this.base);
  }
}
