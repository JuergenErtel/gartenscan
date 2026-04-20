/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.2.42", "localhost"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/onboarding/style",
        destination: "/onboarding/garden",
        permanent: false,
      },
      {
        source: "/onboarding/first-scan",
        destination: "/onboarding/scan",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
