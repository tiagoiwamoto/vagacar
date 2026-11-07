export const environment = {
  production: true,
  apiUrl: 'https://api.vagacar.kamehouse.com.br/api',
  oidc: {
    authority: 'https://auth.kamehouse.com.br/application/o/vagacar/',
    clientId: '3tpYwO26Mv8CLZUpUvrQ6X7cqZ0Qkpr5cSPw6B89',
    redirectUri: typeof window !== 'undefined' ? window.location.origin + '/' : '/',
    postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin + '/' : '/',
    scopes: 'openid profile email',
  },
};
