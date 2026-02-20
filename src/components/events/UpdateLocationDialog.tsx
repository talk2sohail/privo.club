"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Link as LinkIcon } from "lucide-react";
import { updateInvite } from "@/app/actions/invites";
import { toast } from "sonner";

interface UpdateLocationDialogProps {
	inviteId: string;
	currentLocation: string;
	currentMapLink?: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function UpdateLocationDialog({
	inviteId,
	currentLocation,
	currentMapLink,
	open,
	onOpenChange,
}: UpdateLocationDialogProps) {
	const [location, setLocation] = useState(currentLocation);
	const [mapLink, setMapLink] = useState(currentMapLink || "");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			const result = await updateInvite(inviteId, location, mapLink);
			if (result.success) {
				toast.success("Location updated successfully!");
				onOpenChange(false);
			} else {
				toast.error("Failed to update location");
			}
		} catch (error) {
			toast.error("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px] glass border-white/20 text-foreground backdrop-blur-3xl">
				<DialogHeader>
					<DialogTitle>Update Venue Details</DialogTitle>
					<DialogDescription className="text-muted-foreground/60 text-xs">
						Change the venue name or add a maps link for your guests.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-6 pt-4">
					<div className="space-y-2">
						<Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
							Venue Name
						</Label>
						<div className="relative">
							<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
							<Input
								value={location}
								onChange={(e) => setLocation(e.target.value)}
								placeholder="e.g. Radisson Blu, Kolkata"
								className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary"
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
							Maps Link (Google/Apple)
						</Label>
						<div className="relative">
							<LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
							<Input
								value={mapLink}
								onChange={(e) => setMapLink(e.target.value)}
								placeholder="Paste Google Maps link here"
								className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary"
							/>
						</div>
					</div>
					<DialogFooter className="pt-4">
						<Button
							type="submit"
							disabled={loading}
							className="w-full rounded-xl h-12 font-bold"
						>
							{loading ? "Updating..." : "Save Changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
