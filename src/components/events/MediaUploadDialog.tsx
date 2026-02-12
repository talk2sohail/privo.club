"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadMedia } from "@/app/actions/media";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";

interface MediaUploadDialogProps {
	inviteId: string;
}

export function MediaUploadDialog({ inviteId }: MediaUploadDialogProps) {
	const [isOpen, setIsOpen] = useState(false);

	async function handleSubmit(formData: FormData) {
		const result = await uploadMedia(formData);

		if (result.success) {
			toast.success("Memory uploaded successfully!");
			setIsOpen(false);
		} else {
			toast.error(result.error || "Failed to upload memory");
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>
					<UploadCloud className="mr-2 h-4 w-4" />
					Add Memory
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add to Memory Vault</DialogTitle>
					<DialogDescription>
						Upload a photo or video to share with the circle.
					</DialogDescription>
				</DialogHeader>
				<form action={handleSubmit}>
					<input type="hidden" name="inviteId" value={inviteId} />
					<div className="grid gap-4 py-4">
						<div className="grid w-full max-w-sm items-center gap-1.5">
							<Label htmlFor="file">File</Label>
							<Input id="file" name="file" type="file" required />
						</div>
					</div>
					<DialogFooter>
						<SubmitButton />
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function SubmitButton() {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" disabled={pending}>
			{pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
			{pending ? "Uploading..." : "Upload"}
		</Button>
	);
}
