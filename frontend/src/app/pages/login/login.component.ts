import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NbButtonModule, NbCardModule, NbIconModule } from '@nebular/theme';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NbCardModule, NbButtonModule, NbIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.ensureAuthenticatedRedirect();
  }

  private async ensureAuthenticatedRedirect(): Promise<void> {
    await this.authService.initializeAuth();
    if (!this.authService.getToken()) {
      return;
    }

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    await this.router.navigateByUrl(returnUrl);
  }

  async loginWithAuthentik(): Promise<void> {
    this.loading = true;
    try {
      await this.authService.loginWithAuthentik();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      this.loading = false;
    }
  }
}
