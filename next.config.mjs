/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal Turbopack config to acknowledge webpack customization present
  turbopack: {},
  async rewrites() {
    const backend = process.env.API_URL;
    if (!backend) return [];
    return [
      { source: '/auth/:path*', destination: `${backend}/auth/:path*` },
      { source: '/characters/:path*', destination: `${backend}/characters/:path*` },
      { source: '/mint/:path*', destination: `${backend}/mint/:path*` },
      { source: '/battles/:path*', destination: `${backend}/battles/:path*` },
      { source: '/webhooks/:path*', destination: `${backend}/webhooks/:path*` },
      { source: '/users/:path*', destination: `${backend}/users/:path*` },
      { source: '/admin/:path*', destination: `${backend}/admin/:path*` }
    ];
  },
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  }
};

export default nextConfig;


