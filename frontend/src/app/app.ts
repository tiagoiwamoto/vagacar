import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import {
  NbIconModule,
  NbLayoutModule,
  NbMenuItem,
  NbMenuModule,
  NbSidebarModule,
} from '@nebular/theme';

import { AuthService } from './services/auth.service';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NbLayoutModule,
    NbSidebarModule,
    NbMenuModule,
    NbIconModule,
    HeaderComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  isAuthPage = false;

  readonly menu: NbMenuItem[] = [
    { title: 'Pátio', icon: 'car-outline', link: '/patio' },
    { title: 'Serviços', icon: 'list-outline', link: '/servicos' },
    { title: 'Clientes', icon: 'people-outline', link: '/clientes' },
    { title: 'Contas a Receber', icon: 'file-text-outline', link: '/contas-receber' },
    { title: 'Caixa', icon: 'credit-card-outline', link: '/caixa' },
    { title: 'Exclusões', icon: 'trash-2-outline', link: '/exclusoes' },
    { title: 'Configurações', icon: 'settings-2-outline', link: '/configuracoes' },
  ];

  constructor(private authService: AuthService, router: Router) {
    this.isAuthPage = this.isOnAuthPage(router.url);
    router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        this.isAuthPage = this.isOnAuthPage(e.urlAfterRedirects);
      });

    // Initialize auth immediately and wait for it
    this.authService.initializeAuth().catch(error => {
      console.error('Failed to initialize authentication:', error);
    });
  }

  private isOnAuthPage(url: string): boolean {
    return url.startsWith('/login');
  }
}
