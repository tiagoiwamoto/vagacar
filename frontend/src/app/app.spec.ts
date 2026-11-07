import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NbThemeModule } from '@nebular/theme';
import { App } from './app';
import { AuthService } from './services/auth.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        importProvidersFrom(NbThemeModule.forRoot()),
        {
          provide: AuthService,
          useValue: {
            initializeAuth: () => Promise.resolve(),
            getUserProfile: () => null,
            getToken: () => null,
            logout: () => Promise.resolve(),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
