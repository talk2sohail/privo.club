"use client";

import { useEffect, useState } from "react";
import { formatDistance, format } from "date-fns";
import { Lock, Unlock, Image as ImageIcon, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InviteDetails } from "@/types";
import { cn } from "@/lib/utils";

interface MemoryVaultProps {
  invite: InviteDetails;
}

export function MemoryVault({ invite }: MemoryVaultProps) {
  // If unlocked, show unlocked state
  if (invite.isVaultUnlocked) {
    return (
      <div className="glass p-8 rounded-[2.5rem] border-purple-500/30 bg-purple-500/10 items-center justify-center flex flex-col text-center shadow-lg hover:bg-purple-500/20 transition-colors group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 mx-auto ring-1 ring-purple-500/30 group-hover:scale-110 transition-transform duration-500">
            <Unlock className="w-8 h-8 text-purple-300 drop-shadow-md" />
          </div>
          
          <h4 className="font-bold text-2xl mb-2 bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
            Vault Unlocked
          </h4>
          
          <p className="text-xs text-purple-200/70 mb-6 font-medium uppercase tracking-widest">
            {invite.mediaItems?.length || 0} Memories Inside
          </p>

          <Link href={`/event/${invite.id}/gallery`} className="w-full">
            <Button
              className="w-full rounded-xl h-12 text-sm font-bold bg-purple-500 hover:bg-purple-400 text-white shadow-lg shadow-purple-500/25 transition-all active:scale-95"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Open Gallery
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // If locked, calculate unlock time (24h after event start)
  const eventDate = new Date(invite.eventDate);
  const unlockDate = new Date(eventDate.getTime() + 24 * 60 * 60 * 1000);
  
  // Simple countdown text
  const [timeUntilUnlock, setTimeUntilUnlock] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      if (now < unlockDate) {
        setTimeUntilUnlock(formatDistance(unlockDate, now, { addSuffix: true }));
      } else {
        setTimeUntilUnlock("soon..."); // Should refrain via server revalidation usually
      }
    };
    
    updateTime();
    const timer = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [unlockDate]);

  return (
    <div className="glass p-8 rounded-[2.5rem] border-white/10 bg-linear-to-br from-blue-500/5 to-purple-500/5 items-center justify-center flex flex-col text-center shadow-lg relative overflow-hidden">
      <div className="absolute top-3 right-3">
        <Lock className="w-4 h-4 text-white/20" />
      </div>

      <ImageIcon className="w-12 h-12 text-white/20 mb-4" />
      
      <h4 className="font-bold text-lg mb-2 text-white/80">Memory Vault</h4>
      
      <p className="text-[11px] text-muted-foreground mb-6 font-medium uppercase tracking-[0.2em]">
        Unlocks {timeUntilUnlock}
      </p>

      <div className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-white/40 flex items-center justify-center gap-2">
        <Clock className="w-3.5 h-3.5" />
        <span>{format(unlockDate, "MMM d, h:mm a")}</span>
      </div>
    </div>
  );
}
