/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [],
        unoptimized: true,
    },
    experimental: {
        serverComponentsExternalPackages: ['formidable'],
    },
};

export default nextConfig;
