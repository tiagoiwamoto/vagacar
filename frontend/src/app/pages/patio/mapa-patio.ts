import { Component, computed, input, output } from '@angular/core';

import { NbCardModule, NbIconModule } from '@nebular/theme';

import { VagaStatus } from '../../core/models';

@Component({
  selector: 'app-mapa-patio',
  imports: [NbCardModule, NbIconModule],
  template: `
    <nb-card class="mapa">
      <nb-card-header>Mapa do pátio</nb-card-header>
      <nb-card-body>
        <div class="rua topo">↑ ENTRADA / SAÍDA ↑</div>
        @for (fileira of fileiras(); track fileira.letra) {
          <div class="fileira">
            @for (v of fileira.vagas; track v.codigo) {
              <div class="vaga" [class.ocupada]="v.ocupada"
                   [title]="v.ocupada ? v.placa + ' — ' + v.veiculo : 'Vaga livre — clique para nova entrada'"
                   (click)="clicar(v)">
                <span class="codigo">{{ v.codigo }}</span>
                @if (v.ocupada) {
                  <div class="carro" [class]="'carro ' + (v.tipo ?? '')">
                    <div class="teto"></div>
                    <div class="parabrisa frente"></div>
                    <div class="corpo"></div>
                    <div class="parabrisa tras"></div>
                  </div>
                  <span class="placa">{{ v.placa }}</span>
                } @else {
                  <nb-icon icon="plus-outline" class="plus"></nb-icon>
                }
              </div>
            }
          </div>
          @if (!$last) { <div class="rua">· · · · · · · · · · · · · · ·</div> }
        }
        <div class="legenda">
          <span><i class="dot PARTICULAR"></i> Particular</span>
          <span><i class="dot PRE_PAGO"></i> Pré-pago</span>
          <span><i class="dot CONVENIO"></i> Convênio</span>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: `
    .mapa { margin-bottom: 1rem; background: #f0f3f8; }
    .rua { text-align: center; color: #9aa4b8; font-size: 0.7rem;
           letter-spacing: 0.4em; padding: 0.3rem 0; }
    .rua.topo { font-weight: 700; letter-spacing: 0.2em; }
    .fileira { display: flex; gap: 0.6rem; justify-content: center; }
    .vaga {
      width: 84px; height: 120px; border: 2px dashed #b7c0d1;
      border-radius: 6px; background: #fff; position: relative;
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 4px; cursor: pointer;
      transition: transform 0.12s ease, border-color 0.12s ease;
    }
    .vaga:hover { transform: translateY(-3px); border-color: #598bff; }
    .vaga .codigo { position: absolute; top: 4px; left: 6px;
      font-size: 0.65rem; font-weight: 700; color: #8f9bb3; }
    .vaga .placa { font-size: 0.6rem; font-weight: 800;
      letter-spacing: 0.06em; }
    .plus { color: #c4ccdb; }
    .carro { width: 44px; height: 72px; border-radius: 12px;
      position: relative; box-shadow: 0 2px 5px rgba(0,0,0,.25); }
    .carro .corpo { position: absolute; inset: 0; border-radius: 12px; }
    .carro .teto { position: absolute; top: 22%; left: 12%; right: 12%;
      height: 45%; border-radius: 8px; background: rgba(255,255,255,.28); }
    .carro .parabrisa { position: absolute; left: 18%; right: 18%;
      height: 8%; background: rgba(20,30,50,.55); border-radius: 3px; }
    .carro .frente { top: 12%; }
    .carro .tras { bottom: 12%; }
    .carro.PARTICULAR { background: #3366ff; }
    .carro.PRE_PAGO { background: #ffaa00; }
    .carro.CONVENIO { background: #00d68f; }
    .legenda { display: flex; gap: 1.2rem; justify-content: center;
      margin-top: 0.8rem; font-size: 0.75rem; color: #5a6b8c; }
    .dot { display: inline-block; width: 10px; height: 10px;
      border-radius: 50%; margin-right: 4px; }
    .dot.PARTICULAR { background: #3366ff; }
    .dot.PRE_PAGO { background: #ffaa00; }
    .dot.CONVENIO { background: #00d68f; }
  `,
})
export class MapaPatioComponent {
  readonly vagas = input.required<VagaStatus[]>();
  readonly vagaLivre = output<string>();
  readonly vagaOcupada = output<VagaStatus>();

  readonly fileiras = computed(() => {
    const grupos = new Map<string, VagaStatus[]>();
    for (const v of this.vagas()) {
      const letra = v.codigo.replace(/[^A-Za-z]/g, '') || '#';
      if (!grupos.has(letra)) grupos.set(letra, []);
      grupos.get(letra)!.push(v);
    }
    return [...grupos.entries()].map(([letra, vs]) => ({ letra, vagas: vs }));
  });

  clicar(v: VagaStatus): void {
    if (v.ocupada) {
      this.vagaOcupada.emit(v);
    } else {
      this.vagaLivre.emit(v.codigo);
    }
  }
}
