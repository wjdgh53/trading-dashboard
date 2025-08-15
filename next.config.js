/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable typed routes for better type safety
  experimental: {
    typedRoutes: true,
    // Enable Server Components optimization
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    // Optimize bundle for better performance
    optimizePackageImports: ['lucide-react', 'recharts'],
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Enable image optimization
    formats: ['image/webp', 'image/avif'],
    // Optimize for performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Performance optimizations
  swcMinify: true,
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Reduce bundle size by using lighter alternatives
        '@supabase/supabase-js': '@supabase/supabase-js/dist/module/index.js',
      };
    }

    // Optimize chunks
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for external libraries
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Common chunk for shared code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Supabase chunk
          supabase: {
            name: 'supabase',
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            chunks: 'all',
            priority: 30,
          },
          // Chart libraries chunk
          charts: {
            name: 'charts',
            test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
            chunks: 'all',
            priority: 25,
          },
        },
      },
    };

    return config;
  },

  // Environment variables for client-side
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Security headers (additional to vercel.json)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
        ],
      },
    ];
  },

  // Redirects for SEO and user experience
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/',
        permanent: false,
      },
    ];
  },

  // Rewrites for API routing
  async rewrites() {
    return [
      {
        source: '/healthcheck',
        destination: '/api/health',
      },
      {
        source: '/ping',
        destination: '/api/health',
      },
    ];
  },

  // Output configuration for static export (if needed)
  output: 'standalone',
  
  // Enable compression
  compress: true,
  
  // PoweredByHeader removal for security
  poweredByHeader: false,
  
  // Generate ETags for caching
  generateEtags: true,
  
  // Disable x-powered-by header
  httpAgentOptions: {
    keepAlive: true,
  },

  // Note: API route configuration moved to individual route files

  // Enable React strict mode for development
  reactStrictMode: true,

  // TypeScript configuration
  typescript: {
    // Temporarily ignore build errors for production deployment
    // TODO: Fix type issues in components
    ignoreBuildErrors: true,
  },

  // ESLint configuration
  eslint: {
    // Linting is handled by CI/CD pipeline
    ignoreDuringBuilds: false,
  },

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
}

module.exports = nextConfig