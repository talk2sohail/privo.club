
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { fetchFromBackend } from "@/lib/api";
import { InviteDetails } from "@/types";
import { Button } from "@/components/ui/button";
import { MediaUploadDialog } from "@/components/events/MediaUploadDialog";

interface GalleryPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function GalleryPage({ params }: GalleryPageProps) {
	const { id } = await params;
	const details = (await fetchFromBackend(`/invites/${id}`)) as InviteDetails;

	if (!details) {
		notFound();
	}

	if (!details.isVaultUnlocked) {
		redirect(`/event/${id}`);
	}

	const mediaItems = details.mediaItems || [];
    // If backend returns URLs relative to its root (e.g., /uploads/...),
    // and fetchFromBackend uses BACKEND_URL, the image src needs to point to BACKEND_URL + url
    // OR we proxy via Next.js images if domain is allowed.
    // My backend returns `/uploads/...` (root relative).
    // I should prefix with http://localhost:8080 (or process.env.BACKEND_URL base).
    const backendBase = process.env.BACKEND_URL || "http://localhost:8080";

	return (
		<main className="min-h-screen bg-black text-white p-4 md:p-8">
			<div className="max-w-6xl mx-auto space-y-8">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Link href={`/event/${id}`}>
							<Button variant="ghost" size="icon" className="text-white hover:text-white/80">
								<ArrowLeft className="h-6 w-6" />
							</Button>
						</Link>
						<div>
							<h1 className="text-2xl font-bold">Memory Vault</h1>
							<p className="text-gray-400 text-sm">
								{details.title} • {mediaItems.length} Memories
							</p>
						</div>
					</div>
					<MediaUploadDialog inviteId={id} />
				</div>

				{mediaItems.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed border-gray-800 rounded-lg bg-gray-900/50">
						<p className="text-gray-400">The vault is empty.</p>
						<p className="text-sm text-gray-500">
							Be the first to contribute a memory!
						</p>
						<MediaUploadDialog inviteId={id} />
					</div>
				) : (
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{mediaItems.map((item) => (
							<div
								key={item.id}
								className="relative aspect-square rounded-xl overflow-hidden bg-gray-900 group"
							>
                                {/* Note: We are using a simple img tag for MVP or Next Image with remotePatterns configured */}
								<img
									src={item.url.startsWith("http") ? item.url : `${backendBase}${item.url}`}
									alt={item.caption || "Memory"}
									className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
								/>
								<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
									<p className="text-xs text-white/80 truncate">
										Added {new Date(item.createdAt).toLocaleDateString()}
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</main>
	);
}
