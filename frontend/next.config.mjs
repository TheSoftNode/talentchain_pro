/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript checking during builds (optional)
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://newassets.hcaptcha.com https://js.hcaptcha.com https://*.web3auth.io https://auth.web3auth.io https://torus.auth0.com https://wallet.coinbase.com https://www.walletlink.org https://connect.trezor.io https://connect.trezor.io/8 blob:;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              font-src 'self' https://fonts.gstatic.com;
              img-src 'self' data: https: blob:;
              connect-src 'self' https: wss: http://localhost:8000 https://*.web3auth.io https://api.web3auth.io https://hcaptcha.com https://*.hcaptcha.com https://newassets.hcaptcha.com;
              frame-src 'self' https: https://*.web3auth.io https://hcaptcha.com https://*.hcaptcha.com;
              worker-src 'self' blob:;
              object-src 'none';
              base-uri 'self';
            `.replace(/\s+/g, ' ').trim()
          }
        ]
      }
    ]
  }
};

export default nextConfig;
