import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Canonical domain enforcement: www.devsolve.app → devsolve.app (HTTP 308).
   *
   * Vercel allows adding a custom redirect for www in the dashboard too, but
   * doing it here means it is version-controlled and works on every preview
   * deployment that has the www alias pointed at it. The `permanent` flag
   * emits a 308 (the permanent form of 307), which preserves the HTTP method
   * through the redirect — better for POST forms and API clients than 301.
   *
   * `has` makes the rule conditional: it only fires when the Host header is
   * www.devsolve.app, so local development (localhost) is unaffected.
   */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.devsolve.app" }],
        destination: "https://devsolve.app/:path*",
        permanent: true,
      },
    ];
  },

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
    // where compression artefacts land on text.
    qualities: [75, 90],
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
