/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  webpack: (config) => {
    config.externals.push({
      canvas: 'commonjs canvas',
    });
    return config;
  },
};

export default nextConfig;
