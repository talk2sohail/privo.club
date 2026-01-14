import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, StaleWhileRevalidate, CacheFirst, ExpirationPlugin } from "serwist";

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    disableDevLogs: true,
    runtimeCaching: [
        {
            matcher: ({ request, url: { pathname }, sameOrigin }) =>
                request.destination === "document" ||
                (sameOrigin && !pathname.startsWith("/api/")),
            handler: new NetworkFirst({
                cacheName: "pages",
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 32,
                        maxAgeSeconds: 24 * 60 * 60, // 24 hours
                    }),
                ],
                networkTimeoutSeconds: 3, // Fallback to cache after 3s
            }),
        },
        {
            matcher: ({ request }) =>
                request.destination === "style" ||
                request.destination === "script" ||
                request.destination === "worker",
            handler: new StaleWhileRevalidate({
                cacheName: "static-resources",
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 32,
                        maxAgeSeconds: 24 * 60 * 60, // 24 hours
                    }),
                ],
            }),
        },
        {
            matcher: ({ request }) => request.destination === "image",
            handler: new CacheFirst({
                cacheName: "images",
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 64,
                        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                    }),
                ],
            }),
        },
        {
            matcher: ({ request, url: { pathname } }) =>
                pathname.startsWith("/_next/image"),
            handler: new StaleWhileRevalidate({
                cacheName: "next-image",
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 64,
                        maxAgeSeconds: 24 * 60 * 60, // 24 hours
                    }),
                ],
            }),
        },
        {
            matcher: ({ request, url: { pathname } }) =>
                pathname.startsWith("/api/"),
            handler: new NetworkFirst({
                cacheName: "apis",
                networkTimeoutSeconds: 10,
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 16,
                        maxAgeSeconds: 24 * 60 * 60,
                    }),
                ],
            }),
        },
        {
            matcher: ({ request }) =>
                request.destination === "font" || request.destination === "manifest",
            handler: new CacheFirst({
                cacheName: "static-assets",
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 16,
                        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                    }),
                ],
            }),
        },
    ],
});

serwist.addEventListeners();
