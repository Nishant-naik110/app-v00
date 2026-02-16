

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
 
  //  Add basePath and assetPrefix for App Fraud
  basePath: '/app',
  assetPrefix: '/app',
 
  images: {
    remotePatterns: [
      {    
        protocol: "https",
        hostname: "infringementportalcontent.mfilterit.com",
        pathname: "/**",
      },
    ],
  },  
}
export default nextConfig;
 