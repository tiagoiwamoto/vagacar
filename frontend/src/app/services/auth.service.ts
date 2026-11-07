import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User, UserManager, UserManagerSettings, WebStorageStateStore } from 'oidc-client-ts';
import { AuthResponse } from '../model/response.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userManager: UserManager;
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;
  private refreshTimer: any = null;

  private loggedIn = new BehaviorSubject<boolean>(this.hasSession());
  private currentUser = new BehaviorSubject<AuthResponse | null>(this.getStoredUser());

  isLoggedIn$ = this.loggedIn.asObservable();
  currentUser$ = this.currentUser.asObservable();

  constructor() {
    const settings: UserManagerSettings = {
      authority: environment.oidc.authority,
      client_id: environment.oidc.clientId,
      redirect_uri: environment.oidc.redirectUri,
      post_logout_redirect_uri: environment.oidc.postLogoutRedirectUri,
      response_type: 'code',
      scope: environment.oidc.scopes,
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      automaticSilentRenew: true,
      includeIdTokenInSilentRenew: true,
      // monitorSession dispara userUnloaded com falso-positivo no Authentik
      // (checksession iframe bloqueado por cookie SameSite/origin), derrubando a sessão local
      monitorSession: false
    };
    this.userManager = new UserManager(settings);

    this.userManager.events.addUserLoaded(async (user) => {
      console.log('AuthService: OIDC user loaded');
      this.persistUser(user);
      await this.syncCurrentUser();
      this.startTokenRefresh();
    });

    this.userManager.events.addUserUnloaded(() => {
      console.log('AuthService: OIDC user unloaded');
      this.clearSession();
    });

    this.userManager.events.addAccessTokenExpired(() => {
      console.log('AuthService: Access token expired');
      this.refreshToken();
    });
  }

  async initializeAuth(): Promise<void> {
    if (this.initialized) {
      console.log('AuthService: Already initialized');
      return;
    }
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      console.log('AuthService: Initializing OIDC...');

      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('code') && url.searchParams.has('state')) {
          console.log('AuthService: Processing OIDC redirect callback...');
          const user = await this.userManager.signinRedirectCallback();
          this.persistUser(user);
          window.history.replaceState({}, document.title, '/');
          this.initialized = true;
          await this.syncCurrentUser();
          this.loggedIn.next(true);
          this.startTokenRefresh();
          return;
        }

        const user = await this.userManager.getUser();

        if (user && user.access_token && !user.expired) {
          this.persistUser(user);
          await this.syncCurrentUser();
          this.loggedIn.next(true);
          this.startTokenRefresh();
        } else {
          console.log('AuthService: No existing OIDC session, checking localStorage...');
          const localToken = localStorage.getItem('token');
          this.loggedIn.next(!!localToken);
        }

        this.initialized = true;
      } catch (error) {
        console.error('AuthService: OIDC initialization failed:', error);
        this.initialized = true;
      } finally {
        this.initializationPromise = null;
      }
    })();

    return this.initializationPromise;
  }

  async loginWithAuthentik(): Promise<void> {
    console.log('AuthService: Initiating OIDC login...');
    await this.userManager.signinRedirect();
  }

  async logout(): Promise<void> {
    this.stopTokenRefresh();
    const user = await this.userManager.getUser();
    if (user) {
      try {
        await this.userManager.signoutRedirect();
        return;
      } catch (error) {
        console.error('Logout redirect error:', error);
      }
    }
    this.clearSession();
    window.location.href = '/login';
  }

  getToken(): string | null {
    const localToken = localStorage.getItem('token');
    if (localToken) {
      console.log('AuthService: Getting token from localStorage');
      return localToken;
    }
    console.log('AuthService: No token found');
    return null;
  }

  async refreshToken(): Promise<boolean> {
    try {
      console.log('AuthService: Attempting to refresh token...');
      const user = await this.userManager.signinSilent();

      if (user) {
        console.log('AuthService: Token refreshed successfully');
        this.persistUser(user);
        await this.syncCurrentUser();
        return true;
      }

      console.warn('AuthService: Silent signin returned no user');
      this.clearSession();
      return false;
    } catch (error) {
      console.error('AuthService: Failed to refresh token', error);
      this.clearSession();
      return false;
    }
  }

  private startTokenRefresh(): void {
    this.stopTokenRefresh();

    const token = this.getToken();
    if (!token) {
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) {
        return;
      }

      const exp = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = (exp - now) * 1000;
      const refreshTime = Math.max(timeUntilExpiry - 30000, 5000);

      console.log(`AuthService: Scheduling token refresh in ${refreshTime / 1000} seconds`);

      this.refreshTimer = setTimeout(async () => {
        console.log('AuthService: Auto-refreshing token...');
        const success = await this.refreshToken();
        if (success) {
          this.startTokenRefresh();
        }
      }, refreshTime);
    } catch (error) {
      console.error('AuthService: Failed to parse token for refresh scheduling', error);
    }
  }

  private stopTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
      console.log('AuthService: Token refresh timer stopped');
    }
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) {
        return true;
      }
      const now = Math.floor(Date.now() / 1000);
      return now >= payload.exp;
    } catch (error) {
      return true;
    }
  }

  getUserProfile(): any {
    const oidc = this.getOidcUserProfile();
    if (oidc) {
      return {
        ...oidc,
        displayName: oidc.name || oidc.username || oidc.email
      };
    }
    return this.currentUser.value;
  }

  async syncCurrentUser(): Promise<void> {
    const user = await this.userManager.getUser();
    if (user && user.access_token) {
      const profile = this.getOidcUserProfile();
      const authResponse: AuthResponse = {
        accountId: profile.sub,
        displayName: profile.name || profile.preferred_username || profile.email,
        status: 'success'
      };
      this.currentUser.next(authResponse);
      this.loggedIn.next(true);
      localStorage.setItem('user', JSON.stringify(authResponse));
    }
  }

  private getOidcUserProfile(): any {
    try {
      // Claims de perfil (name, preferred_username, given_name) vem no id_token,
      // persistido como oidcProfile no login. Access token costuma ter so sub/email.
      const stored = localStorage.getItem('oidcProfile');
      const token = this.getToken();
      const tokenParsed = stored
        ? JSON.parse(stored)
        : (token ? JSON.parse(atob(token.split('.')[1])) : null);
      if (!tokenParsed) {
        return null;
      }
      return {
        id: tokenParsed.sub,
        name: tokenParsed['name'],
        username: tokenParsed['preferred_username'],
        email: tokenParsed.email,
        firstName: tokenParsed['given_name'],
        lastName: tokenParsed['family_name'],
        roles: this.extractRoles(tokenParsed)
      };
    } catch (error) {
      return null;
    }
  }

  private extractRoles(token: any): string[] {
    const groups = token.groups || [];
    const roles = token.roles || [];
    return [...groups, ...roles];
  }

  private persistUser(user: User | null): void {
    if (!user?.access_token) {
      return;
    }
    localStorage.setItem('token', user.access_token);
    if (user.refresh_token) {
      localStorage.setItem('refreshToken', user.refresh_token);
    }
    if (user.profile) {
      localStorage.setItem('oidcProfile', JSON.stringify(user.profile));
    }
  }

  private clearSession(): void {
    this.stopTokenRefresh();
    this.loggedIn.next(false);
    this.currentUser.next(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('oidcProfile');
  }

  private hasSession(): boolean {
    return localStorage.getItem('token') !== null;
  }

  private getStoredUser(): AuthResponse | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  hasRole(role: string): boolean {
    const profile = this.getUserProfile();
    return profile?.roles?.includes(role) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }
}
