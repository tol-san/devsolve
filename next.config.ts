import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
   remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.githubassets.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com/google.com',
      },
      // Or allow all remote HTTPS images during development:
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Next only serves the qualities listed here — anything else is a 400 from
    // /_next/image. 75 is the default; 90 is for screenshots and diagrams,
    // where compression artefacts land on text; 100 is for maximum-fidelity team photos.
    qualities: [75, 90, 100],
  },
  // images: {
  //   dangerouslyAllowSVG: true,
  //   contentDispositionType: 'attachment',
  //   contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  //   remotePatterns: [
  //     {
  //       protocol: 'https',
  //       hostname: 'cdn.simpleicons.org',
  //     },
  //   ],
  // },
};

export default nextConfig;




// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'i.pravatar.cc',
//       },
//       {
//         protocol: 'https',
//         hostname: 'images.unsplash.com',
//       },
//     ],
//   },
// };

// module.exports = nextConfig;
