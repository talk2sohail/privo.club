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
import { Copy, RefreshCw, Check } from "lucide-react";
import { useState } from "react";
import { regenerateInviteCode } from "@/app/actions/circles";
import { toast } from "sonner";

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
      : `https://invito.app/invite/${inviteCode}`; // Fallback for heavy SSR if needed, though client component usually fine

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
      <DialogContent className="sm:max-w-md bg-zinc-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Share this link with anyone you want to join this circle.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              type="text"
              readOnly
              className="bg-black/50 border-white/10 text-zinc-300 h-11"
              value={inviteLink}
            />
          </div>
          <Button
            type="button"
            size="icon"
            onClick={copyToClipboard}
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
        <DialogFooter className="sm:justify-between mt-4">
          {isOwner && (
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
          )}
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="ml-auto">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
