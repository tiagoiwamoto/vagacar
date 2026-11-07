import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface VeiculoItem {
  codigo: string;
  nome: string;
}

@Injectable({ providedIn: 'root' })
export class VeiculoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/veiculos`;

  marcas(): Observable<VeiculoItem[]> {
    return this.http.get<VeiculoItem[]>(`${this.base}/marcas`);
  }

  modelos(codigoMarca: string): Observable<VeiculoItem[]> {
    return this.http.get<VeiculoItem[]>(
        `${this.base}/modelos`, { params: { marca: codigoMarca } });
  }
}
