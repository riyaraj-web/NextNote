module.exports = {
  async rewrites() {
    return [
      { source: '/notes/:path*', destination: '/api/notes/:path*' },
      { source: '/notes', destination: '/api/notes' },

      { source: '/tenants/:slug/upgrade', destination: '/api/tenants/:slug/upgrade' },
      { source: '/tenants/:slug/invite', destination: '/api/tenants/:slug/invite' },

      { source: '/health', destination: '/api/health' },

      { source: '/auth/:path*', destination: '/api/auth/:path*' },
    ];
  },
};
