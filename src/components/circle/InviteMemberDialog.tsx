"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw, Check, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { regenerateInviteCode } from "@/app/actions/circles";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InviteMemberDialogProps {
	circleId: string;
	inviteCode: string; // Pre-generated code
	children: React.ReactNode;
	isOwner?: boolean;
}

export function InviteMemberDialog({
	circleId,
	inviteCode: initialInviteCode,
	children,
	isOwner = false,
}: InviteMemberDialogProps) {
	const [inviteCode, setInviteCode] = useState(initialInviteCode);
	const [isCopied, setIsCopied] = useState(false);
	const [isRegenerating, setIsRegenerating] = useState(false);
	const [open, setOpen] = useState(false);

	const inviteLink =
		typeof window !== "undefined"
			? `${window.location.origin}/invite/${inviteCode}`
			: `https://invito.app/invite/${inviteCode}`;

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(inviteLink);
			setIsCopied(true);
			toast.success("Invite link copied to clipboard");
			setTimeout(() => setIsCopied(false), 2000);
		} catch {
			toast.error("Failed to copy link");
		}
	};

	const handleRegenerate = async () => {
		try {
			setIsRegenerating(true);
			const newCode = await regenerateInviteCode(circleId);
			setInviteCode(newCode);
			toast.success("New invite link generated");
		} catch {
			toast.error("Failed to generate new link");
		} finally {
			setIsRegenerating(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-lg bg-zinc-950/90 border-white/10 text-white backdrop-blur-xl shadow-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-xl">
						<LinkIcon className="w-5 h-5 text-blue-500" />
						Invite Members
					</DialogTitle>
					<DialogDescription className="text-zinc-400 text-base">
						Share this link with anyone you want to join this hive.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4 mt-4">
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<LinkIcon className="h-4 w-4 text-zinc-500" />
						</div>
						<Input
							id="link"
							type="text"
							readOnly
							className="pl-9 pr-24 bg-zinc-900/50 border-white/10 text-zinc-300 h-12 text-sm font-mono"
							value={inviteLink}
						/>
						<Button
							type="button"
							size="sm"
							onClick={copyToClipboard}
							className={cn(
								"absolute right-1 top-1 bottom-1 h-auto px-4 font-bold transition-all",
								isCopied
									? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
									: "bg-white/10 text-white hover:bg-white/20",
							)}
						>
							{isCopied ? (
								<>
									<Check className="h-3 w-3 mr-2" />
									Copied
								</>
							) : (
								<>
									<Copy className="h-3 w-3 mr-2" />
									Copy
								</>
							)}
						</Button>
					</div>
				</div>
				<DialogFooter className="sm:justify-between mt-4 items-center">
					{isOwner ? (
						<Button
							variant="ghost"
							size="sm"
							onClick={handleRegenerate}
							disabled={isRegenerating}
							className="text-xs text-zinc-500 hover:text-white h-auto py-2 px-0 hover:bg-transparent"
						>
							<RefreshCw
								className={`w-3 h-3 mr-2 ${isRegenerating ? "animate-spin" : ""}`}
							/>
							{isRegenerating ? "Generating..." : "Regenerate link"}
						</Button>
					) : (
						<div />
					)}
					<DialogClose asChild>
						<Button
							type="button"
							variant="secondary"
							className="bg-white/10 hover:bg-white/20 text-white border-0"
						>
							Done
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
