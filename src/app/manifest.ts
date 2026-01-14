import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Invito",
    short_name: "Invito",
    description: "The modern way to invite and celebrate with your close ones.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#7c3aed",
    icons: [
      {
        src: "/icons/icon-small.webp",
        sizes: "48x48",
        type: "image/webp",
      },
      {
        src: "/icons/icon-medium.ico",
        sizes: "72x72 96x96 128x128 256x256",
      },
      {
        src: "/icons/icon-high.svg",
        sizes: "257x257",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
