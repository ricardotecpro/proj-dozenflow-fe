export const environment = {
  production: true,
  // Relative path: proxied to the Render backend via the Netlify redirect
  // in netlify.toml ("/api/*" -> https://dozenflow-be.onrender.com/api/*).
  apiUrl: '/api',
};
