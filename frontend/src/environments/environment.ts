export const environment = {
  production: false,
  apiUrl: '/api',
  oidc: {
    authority: 'https://auth.kamehouse.com.br/application/o/vagacar/',
    clientId: '3tpYwO26Mv8CLZUpUvrQ6X7cqZ0Qkpr5cSPw6B89',
    redirectUri: typeof window !== 'undefined' ? window.location.origin + '/' : 'http://localhost:4200/',
    postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin + '/' : 'http://localhost:4200/',
    scopes: 'openid profile email'
  }
};
