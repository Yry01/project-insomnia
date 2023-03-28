export const environment = {
  production: false,
  backendUrl: 'http://localhost:3000',
  auth: {
    domain: 'dev-hpc5hctabd1e0xhl.us.auth0.com',
    clientId: 'yTAS8N2p5Nog3fAxbQ5uuzbborxoSv3e',
    authorizationParams: {
      redirect_uri: window.location.origin,
    },
  },

  peerjsPort: 3000,
  peerjsHost: 'localhost',
  peerjsSecure: false,
};
