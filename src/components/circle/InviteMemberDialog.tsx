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
import { Copy, RefreshCw, Check, Trash2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import {
  regenerateInviteCode,
  updateCircleSettings,
  createLimitedInviteLink,
  getLimitedInviteLinks,
  revokeLimitedInviteLink,
} from "@/app/actions/circles";
import { toast } from "sonner";

interface InviteMemberDialogProps {
  circleId: string;
  inviteCode: string;
  isInviteLinkEnabled?: boolean;
  children: React.ReactNode;
  isOwner?: boolean;
}

interface LimitedInviteLink {
  id: string;
  code: string;
  maxUses: number;
  usedCount: number;
  createdAt: Date;
}

export function InviteMemberDialog({
  circleId,
  inviteCode: initialInviteCode,
  isInviteLinkEnabled: initialIsEnabled = true,
  children,
  isOwner = false,
}: InviteMemberDialogProps) {
  const [inviteCode, setInviteCode] = useState(initialInviteCode);
  const [isInviteLinkEnabled, setIsInviteLinkEnabled] =
    useState(initialIsEnabled);
  const [isCopied, setIsCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [open, setOpen] = useState(false);
  const [maxUses, setMaxUses] = useState(5);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [limitedLinks, setLimitedLinks] = useState<LimitedInviteLink[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);

  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/invite/${inviteCode}`
      : `https://invito.app/invite/${inviteCode}`;

  useEffect(() => {
    if (open && isOwner) {
      loadLimitedLinks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isOwner]);

  const loadLimitedLinks = async () => {
    try {
      setIsLoadingLinks(true);
      const links = await getLimitedInviteLinks(circleId);
      setLimitedLinks(links as LimitedInviteLink[]);
    } catch {
      toast.error("Failed to load limited links");
    } finally {
      setIsLoadingLinks(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      const link =
        typeof window !== "undefined"
          ? `${window.location.origin}/invite/${code}`
          : `https://invito.app/invite/${code}`;
      await navigator.clipboard.writeText(link);
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

  const handleToggleInviteLink = async (enabled: boolean) => {
    try {
      await updateCircleSettings(circleId, { isInviteLinkEnabled: enabled });
      setIsInviteLinkEnabled(enabled);
      toast.success(
        enabled ? "Invite link enabled" : "Invite link disabled",
      );
    } catch {
      toast.error("Failed to update settings");
    }
  };

  const handleCreateLimitedLink = async () => {
    if (maxUses < 1) {
      toast.error("Max uses must be at least 1");
      return;
    }

    try {
      setIsCreatingLink(true);
      await createLimitedInviteLink(circleId, maxUses);
      toast.success("Limited invite link created");
      await loadLimitedLinks();
      setMaxUses(5); // Reset to default
    } catch {
      toast.error("Failed to create limited link");
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleRevokeLink = async (linkId: string) => {
    try {
      await revokeLimitedInviteLink(linkId);
      toast.success("Link revoked");
      await loadLimitedLinks();
    } catch {
      toast.error("Failed to revoke link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-zinc-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Share links with people you want to join this circle.
          </DialogDescription>
        </DialogHeader>

        {isOwner ? (
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
              <TabsTrigger value="general">General Link</TabsTrigger>
              <TabsTrigger value="limited">Limited Links</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-link" className="text-sm font-medium">
                    Enable Invite Link
                  </Label>
                  <p className="text-xs text-zinc-500">
                    When disabled, this link won&apos;t accept new members
                  </p>
                </div>
                <Switch
                  id="enable-link"
                  checked={isInviteLinkEnabled}
                  onCheckedChange={handleToggleInviteLink}
                />
              </div>

              <div
                className={`space-y-2 ${!isInviteLinkEnabled ? "opacity-50" : ""}`}
              >
                <Label htmlFor="link" className="text-sm">
                  Invite Link {!isInviteLinkEnabled && "(Disabled)"}
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="link"
                    type="text"
                    readOnly
                    className="bg-black/50 border-white/10 text-zinc-300 h-11"
                    value={inviteLink}
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => copyToClipboard(inviteCode)}
                    className="h-11 w-11 shrink-0 bg-white/10 hover:bg-white/20 text-white border-0"
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
                {!isInviteLinkEnabled && (
                  <p className="text-xs text-amber-500">
                    Link is currently disabled
                  </p>
                )}
                <p className="text-xs text-zinc-500">
                  Members joining via this link will need approval
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="text-xs text-zinc-500 hover:text-white"
              >
                <RefreshCw
                  className={`w-3 h-3 mr-2 ${isRegenerating ? "animate-spin" : ""}`}
                />
                {isRegenerating ? "Generating..." : "Generate new link"}
              </Button>
            </TabsContent>

            <TabsContent value="limited" className="space-y-4">
              <div className="space-y-3">
                <div className="bg-zinc-800/50 p-4 rounded-lg space-y-3">
                  <Label htmlFor="max-uses" className="text-sm font-medium">
                    How many people can join?
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="max-uses"
                      type="number"
                      min="1"
                      value={maxUses}
                      onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                      className="bg-black/50 border-white/10 text-zinc-300 h-10"
                      placeholder="5"
                    />
                    <Button
                      onClick={handleCreateLimitedLink}
                      disabled={isCreatingLink}
                      className="h-10 bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {isCreatingLink ? "Creating..." : "Generate Link"}
                    </Button>
                  </div>
                  <p className="text-xs text-zinc-500">
                    People joining with this link will be approved automatically
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Active Links</Label>
                  {isLoadingLinks ? (
                    <p className="text-sm text-zinc-500">Loading...</p>
                  ) : limitedLinks.length === 0 ? (
                    <div className="text-center py-8 px-4 bg-zinc-800/30 rounded-lg">
                      <p className="text-sm text-zinc-500">
                        No active limited links.
                      </p>
                      <p className="text-xs text-zinc-600 mt-1">
                        Create a link to allow specific people to join instantly.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {limitedLinks.map((link) => (
                        <div
                          key={link.id}
                          className="bg-zinc-800/50 p-3 rounded-lg space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <code className="text-xs text-purple-400 bg-black/30 px-2 py-1 rounded">
                              {link.code}
                            </code>
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => copyToClipboard(link.code)}
                                className="h-8 w-8 text-zinc-400 hover:text-white"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleRevokeLink(link.id)}
                                className="h-8 w-8 text-zinc-400 hover:text-red-500"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500">
                              {link.usedCount} / {link.maxUses} joined
                            </span>
                            <div className="flex-1 mx-3 bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-purple-500 h-full rounded-full transition-all"
                                style={{
                                  width: `${(link.usedCount / link.maxUses) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                readOnly
                className="bg-black/50 border-white/10 text-zinc-300 h-11"
                value={inviteLink}
              />
              <Button
                type="button"
                size="icon"
                onClick={() => copyToClipboard(inviteCode)}
                className="h-11 w-11 shrink-0 bg-white/10 hover:bg-white/20 text-white border-0"
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
