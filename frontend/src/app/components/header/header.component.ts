import { Component, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  NbActionsModule,
  NbContextMenuModule,
  NbIconModule,
  NbMenuItem,
  NbMenuService,
  NbSidebarService,
  NbUserModule,
} from '@nebular/theme';
import { filter, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NbActionsModule, NbContextMenuModule, NbIconModule, NbUserModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnDestroy {
  userMenu: NbMenuItem[] = [{ title: 'Sair', icon: 'log-out-outline' }];

  private destroy$ = new Subject<void>();

  constructor(
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private authService: AuthService
  ) {
    this.menuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'user-context-menu'),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.authService.logout());
  }

  get userName(): string {
    const profile = this.authService.getUserProfile();
    return profile?.displayName || profile?.username || 'Usuário';
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(false, 'menu-sidebar');
    return false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
