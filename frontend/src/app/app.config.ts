import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  importProvidersFrom,
} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import localePt from '@angular/common/locales/pt';

import {
  NbThemeModule,
  NbSidebarModule,
  NbMenuModule,
  NbDialogModule,
  NbToastrModule,
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    importProvidersFrom(
      NbThemeModule.forRoot({ name: 'default' }),
      NbSidebarModule.forRoot(),
      NbMenuModule.forRoot(),
      NbDialogModule.forRoot(),
      NbToastrModule.forRoot(),
      NbEvaIconsModule,
    ),
  ],
};
