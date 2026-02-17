/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' }
    ],
  },
  env: {
    MONGODB_URI: "mongodb+srv://uviii24568_db_user:%40sujal1234@cluster0.kz5lwzw.mongodb.net/?appName=Cluster0",
    JWT_SECRET: "sujal_secret_123",
  },
  async rewrites() {
    // Check both potential env vars for flexibility
    let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

    // Clean up the URL: if it ends with /api, remove it because we add it in the destination
    if (backendUrl.endsWith('/api')) {
      backendUrl = backendUrl.slice(0, -4);
    }
    if (backendUrl.endsWith('/api/')) {
      backendUrl = backendUrl.slice(0, -5);
    }

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
