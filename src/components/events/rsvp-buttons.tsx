"use client";

import { useState } from "react";
import { submitRSVP } from "@/app/actions/invites";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RsvpButtonsProps {
  inviteId: string;
  myRsvpStatus?: string;
}

export function RsvpButtons({ inviteId, myRsvpStatus }: RsvpButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<string | undefined>(myRsvpStatus);

  async function handleRsvp(newStatus: string) {
    setLoading(newStatus);
    try {
      await submitRSVP(inviteId, newStatus, 1);
      setStatus(newStatus);
      toast.success(newStatus === "YES" ? "See you there!" : "We'll miss you!");
    } catch {
      toast.error("Failed to submit RSVP.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-4">
      <Button
        onClick={() => handleRsvp("YES")}
        disabled={!!loading}
        className={cn(
          "flex-1 h-12 rounded-xl font-bold gap-2 transition-all duration-300",
          status === "YES"
            ? "bg-primary shadow-lg shadow-primary/30"
            : "bg-primary/20 text-primary hover:bg-primary/30",
        )}
      >
        {loading === "YES" ? (
          "Wait..."
        ) : (
          <>
            <Check className="w-5 h-5" />
            Yes, I&apos;m in
          </>
        )}
      </Button>
      <Button
        onClick={() => handleRsvp("NO")}
        disabled={!!loading}
        variant="outline"
        className={cn(
          "flex-1 h-12 rounded-xl font-bold gap-2 border-white/10 transition-all duration-300",
          status === "NO"
            ? "bg-destructive text-white border-destructive shadow-lg shadow-destructive/30"
            : "glass hover:bg-white/10",
        )}
      >
        {loading === "NO" ? (
          "Wait..."
        ) : (
          <>
            <X className="w-5 h-5" />
            Can&apos;t make it
          </>
        )}
      </Button>
    </div>
  );
}
