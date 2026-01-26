"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Copy,
	RefreshCw,
	Check,
	Link as LinkIcon,
	Trash2,
	Plus,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
	regenerateInviteCode,
	updateCircleSettings,
	createInviteLink,
	getInviteLinks,
	revokeInviteLink,
} from "@/app/actions/circles";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CircleInviteLink } from "@/types";

interface InviteMemberDialogProps {
	circleId: string;
	inviteCode: string;
	isInviteLinkEnabled: boolean;
	children: React.ReactNode;
	isOwner?: boolean;
}

export function InviteMemberDialog({
	circleId,
	inviteCode: initialInviteCode,
	isInviteLinkEnabled: initialIsEnabled,
	children,
	isOwner = false,
}: InviteMemberDialogProps) {
	const [inviteCode, setInviteCode] = useState(initialInviteCode);
	const [isEnabled, setIsEnabled] = useState(initialIsEnabled);
	const [isCopied, setIsCopied] = useState(false);
	const [isRegenerating, setIsRegenerating] = useState(false);
	const [isTogglingEnabled, setIsTogglingEnabled] = useState(false);
	const [open, setOpen] = useState(false);

	// Limited links state
	const [limitedLinks, setLimitedLinks] = useState<CircleInviteLink[]>([]);
	const [maxUses, setMaxUses] = useState(5);
	const [isCreatingLink, setIsCreatingLink] = useState(false);
	const [isLoadingLinks, setIsLoadingLinks] = useState(false);

	const inviteLink =
		typeof window !== "undefined"
			? `${window.location.origin}/invite/${inviteCode}`
			: `https://invito.app/invite/${inviteCode}`;

	// Load limited links when dialog opens
	useEffect(() => {
		if (open && isOwner) {
			loadLimitedLinks();
		}
	}, [open, isOwner]);

	const loadLimitedLinks = async () => {
		setIsLoadingLinks(true);
		try {
			const links = await getInviteLinks(circleId);
			setLimitedLinks(links);
		} catch (error) {
			toast.error("Failed to load invite links");
		} finally {
			setIsLoadingLinks(false);
		}
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setIsCopied(true);
			toast.success("Link copied to clipboard");
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

	const handleToggleEnabled = async (checked: boolean) => {
		try {
			setIsTogglingEnabled(true);
			await updateCircleSettings(circleId, { isInviteLinkEnabled: checked });
			setIsEnabled(checked);
			toast.success(
				checked ? "Invite link enabled" : "Invite link disabled"
			);
		} catch {
			toast.error("Failed to update settings");
		} finally {
			setIsTogglingEnabled(false);
		}
	};

	const handleCreateLimitedLink = async () => {
		if (!maxUses || maxUses < 1 || !Number.isInteger(maxUses)) {
			toast.error("Max uses must be a valid number of at least 1");
			return;
		}

		try {
			setIsCreatingLink(true);
			await createInviteLink(circleId, maxUses);
			toast.success("Limited invite link created");
			setMaxUses(5); // Reset
			await loadLimitedLinks();
		} catch {
			toast.error("Failed to create invite link");
		} finally {
			setIsCreatingLink(false);
		}
	};

	const handleRevokeLink = async (linkId: string) => {
		try {
			await revokeInviteLink(circleId, linkId);
			toast.success("Invite link revoked");
			await loadLimitedLinks();
		} catch {
			toast.error("Failed to revoke link");
		}
	};

	const getLimitedLinkUrl = (code: string) => {
		return typeof window !== "undefined"
			? `${window.location.origin}/invite/${code}`
			: `https://invito.app/invite/${code}`;
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
						Share invite links to grow your circle.
					</DialogDescription>
				</DialogHeader>

				<Tabs defaultValue="general" className="w-full mt-4">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="general">General Link</TabsTrigger>
						<TabsTrigger value="limited">Limited Links</TabsTrigger>
					</TabsList>

					<TabsContent value="general" className="space-y-4">
						{isOwner && (
							<div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-white/10">
								<Label htmlFor="enable-link" className="text-sm text-zinc-300">
									Enable Invite Link
								</Label>
								<Switch
									id="enable-link"
									checked={isEnabled}
									onCheckedChange={handleToggleEnabled}
									disabled={isTogglingEnabled}
								/>
							</div>
						)}

						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<LinkIcon
									className={cn(
										"h-4 w-4",
										isEnabled ? "text-zinc-500" : "text-zinc-700"
									)}
								/>
							</div>
							<Input
								id="link"
								type="text"
								readOnly
								disabled={!isEnabled}
								className={cn(
									"pl-9 pr-24 bg-zinc-900/50 border-white/10 text-zinc-300 h-12 text-sm font-mono",
									!isEnabled && "opacity-50 cursor-not-allowed"
								)}
								value={inviteLink}
							/>
							<Button
								type="button"
								size="sm"
								onClick={() => copyToClipboard(inviteLink)}
								disabled={!isEnabled}
								className={cn(
									"absolute right-1 top-1 bottom-1 h-auto px-4 font-bold transition-all",
									isCopied
										? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
										: "bg-white/10 text-white hover:bg-white/20",
									!isEnabled && "opacity-50 cursor-not-allowed"
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

						{!isEnabled && (
							<p className="text-xs text-zinc-500 text-center">
								Link is currently disabled. Enable it to allow new members to
								join.
							</p>
						)}

						{isOwner && isEnabled && (
							<Button
								variant="ghost"
								size="sm"
								onClick={handleRegenerate}
								disabled={isRegenerating}
								className="w-full text-xs text-zinc-500 hover:text-white h-auto py-2 hover:bg-white/5"
							>
								<RefreshCw
									className={`w-3 h-3 mr-2 ${isRegenerating ? "animate-spin" : ""}`}
								/>
								{isRegenerating ? "Generating..." : "Regenerate link"}
							</Button>
						)}
					</TabsContent>

					<TabsContent value="limited" className="space-y-4">
						{isOwner && (
							<>
								<div className="space-y-3 p-4 rounded-lg bg-zinc-900/50 border border-white/10">
									<Label htmlFor="max-uses" className="text-sm text-zinc-300">
										How many people can join?
									</Label>
									<div className="flex gap-2">
										<Input
											id="max-uses"
											type="number"
											min="1"
											step="1"
											value={maxUses}
											onChange={(e) => {
												const val = parseInt(e.target.value);
												if (!isNaN(val) && val > 0) {
													setMaxUses(val);
												}
											}}
											onKeyDown={(e) => {
												// Prevent decimal point, e, +, - characters
												if (['.', 'e', 'E', '+', '-'].includes(e.key)) {
													e.preventDefault();
												}
											}}
											className="bg-zinc-900/50 border-white/10 text-white"
										/>
										<Button
											onClick={handleCreateLimitedLink}
											disabled={isCreatingLink}
											className="bg-blue-500 hover:bg-blue-600 text-white"
										>
											<Plus className="w-4 h-4 mr-2" />
											{isCreatingLink ? "Creating..." : "Generate"}
										</Button>
									</div>
								</div>

								<div className="space-y-2">
									<Label className="text-sm text-zinc-400">Active Links</Label>
									{isLoadingLinks ? (
										<p className="text-sm text-zinc-500 text-center py-8">
											Loading...
										</p>
									) : limitedLinks.length === 0 ? (
										<div className="text-center py-8 px-4 rounded-lg bg-zinc-900/30 border border-white/5">
											<p className="text-sm text-zinc-500">
												No active limited links.
											</p>
											<p className="text-xs text-zinc-600 mt-1">
												Create a link to allow specific people to join
												instantly.
											</p>
										</div>
									) : (
										<div className="space-y-2 max-h-[300px] overflow-y-auto">
											{limitedLinks.map((link) => (
												<div
													key={link.id}
													className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-white/10"
												>
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2 mb-1">
															<code className="text-xs text-blue-400 font-mono truncate">
																{link.code}
															</code>
														</div>
														<div className="flex items-center gap-2">
															<div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
																<div
																	className="bg-blue-500 h-full transition-all"
																	style={{
																		width: `${(link.usedCount / link.maxUses) * 100}%`,
																	}}
																/>
															</div>
															<span className="text-xs text-zinc-500 whitespace-nowrap">
																{link.usedCount}/{link.maxUses}
															</span>
														</div>
													</div>
													<div className="flex items-center gap-1 ml-3">
														<Button
															variant="ghost"
															size="sm"
															onClick={() =>
																copyToClipboard(getLimitedLinkUrl(link.code))
															}
															className="h-8 w-8 p-0 hover:bg-white/10"
														>
															<Copy className="h-3 w-3" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleRevokeLink(link.id)}
															className="h-8 w-8 p-0 hover:bg-red-500/20 text-red-400"
														>
															<Trash2 className="h-3 w-3" />
														</Button>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							</>
						)}

						{!isOwner && (
							<p className="text-sm text-zinc-500 text-center py-8">
								Only the circle owner can manage limited invite links.
							</p>
						)}
					</TabsContent>
				</Tabs>

				<div className="flex justify-end mt-4">
					<DialogClose asChild>
						<Button
							type="button"
							variant="secondary"
							className="bg-white/10 hover:bg-white/20 text-white border-0"
						>
							Done
						</Button>
					</DialogClose>
				</div>
			</DialogContent>
		</Dialog>
	);
}
