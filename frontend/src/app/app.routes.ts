import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', pathMatch: 'full', redirectTo: 'patio' },
  {
    path: 'patio',
    loadComponent: () =>
        import('./pages/patio/patio').then(m => m.PatioComponent),
    canActivate: [authGuard],
  },
  {
    path: 'servicos',
    loadComponent: () =>
        import('./pages/servicos/servicos').then(m => m.ServicosComponent),
    canActivate: [authGuard],
  },
  {
    path: 'clientes',
    loadComponent: () =>
        import('./pages/clientes/clientes').then(m => m.ClientesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'contas-receber',
    loadComponent: () =>
        import('./pages/contas-receber/contas-receber')
            .then(m => m.ContasReceberComponent),
    canActivate: [authGuard],
  },
  {
    path: 'caixa',
    loadComponent: () =>
        import('./pages/caixa/caixa').then(m => m.CaixaComponent),
    canActivate: [authGuard],
  },
  {
    path: 'configuracoes',
    loadComponent: () =>
        import('./pages/configuracoes/configuracoes')
            .then(m => m.ConfiguracoesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'exclusoes',
    loadComponent: () =>
        import('./pages/exclusoes/exclusoes').then(m => m.ExclusoesComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'patio' },
];
