"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings, Trash } from "lucide-react";
import { useState } from "react";
import { DeleteInviteDialog } from "./DeleteInviteDialog";

interface EventSettingsMenuProps {
  inviteId: string;
  inviteTitle: string;
}

export function EventSettingsMenu({ inviteId, inviteTitle }: EventSettingsMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
             className="rounded-full border border-white/5 glass hover:scale-110 transition-transform"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 text-white">
          <DropdownMenuLabel>Event Settings</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer flex items-center gap-2"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="w-4 h-4" />
            Delete Event
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteInviteDialog
        inviteId={inviteId}
        inviteTitle={inviteTitle}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}
