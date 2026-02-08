"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { updateUserProfile } from "@/app/actions/user";
import { toast } from "sonner";
import { Settings } from "lucide-react";

interface EditProfileDialogProps {
	userId: string;
	currentName?: string;
	currentBio?: string;
	currentVisibility?: "PUBLIC" | "PRIVATE" | "CIRCLES_ONLY";
}

export function EditProfileDialog({
	userId,
	currentName,
	currentBio,
	currentVisibility,
}: EditProfileDialogProps) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [name, setName] = useState(currentName || "");
	const [bio, setBio] = useState(currentBio || "");
	const [visibility, setVisibility] = useState<
		"PUBLIC" | "PRIVATE" | "CIRCLES_ONLY"
	>(currentVisibility || "PUBLIC");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			await updateUserProfile(userId, {
				name: name || undefined,
				bio: bio || undefined,
				profileVisibility: visibility,
			});

			toast.success("Profile updated successfully!");
			setOpen(false);
			window.location.reload(); // Reload to show updated data
		} catch (error: any) {
			toast.error(error.message || "Failed to update profile");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<Settings className="h-4 w-4 mr-2" />
					Edit Profile
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[525px]">
				<DialogHeader>
					<DialogTitle>Edit Profile</DialogTitle>
					<DialogDescription>
						Update your profile information and privacy settings.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Your name"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="bio">Bio</Label>
							<Textarea
								id="bio"
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								placeholder="Tell us about yourself..."
								rows={4}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="visibility">Profile Visibility</Label>
							<Select value={visibility} onValueChange={(value: "PUBLIC" | "PRIVATE" | "CIRCLES_ONLY") => setVisibility(value)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="PUBLIC">Public</SelectItem>
									<SelectItem value="CIRCLES_ONLY">Circles Only</SelectItem>
									<SelectItem value="PRIVATE">Private</SelectItem>
								</SelectContent>
							</Select>
							<p className="text-xs text-muted-foreground">
								{visibility === "PUBLIC" && "Anyone can view your profile"}
								{visibility === "CIRCLES_ONLY" &&
									"Only members of your circles can view your profile"}
								{visibility === "PRIVATE" && "Only you can view your profile"}
							</p>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={loading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? "Saving..." : "Save Changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
