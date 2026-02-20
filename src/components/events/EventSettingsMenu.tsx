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
import { Settings, Trash, MapPin } from "lucide-react";
import { useState } from "react";
import { DeleteInviteDialog } from "./DeleteInviteDialog";
import { UpdateLocationDialog } from "./UpdateLocationDialog";

interface EventSettingsMenuProps {
  inviteId: string;
  inviteTitle: string;
  currentLocation: string;
  currentMapLink?: string;
}

export function EventSettingsMenu({ inviteId, inviteTitle, currentLocation, currentMapLink }: EventSettingsMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

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
            className="focus:bg-white/10 cursor-pointer flex items-center gap-2"
            onClick={() => setShowUpdateDialog(true)}
          >
            <MapPin className="w-4 h-4" />
            Update Venue
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer flex items-center gap-2"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="w-4 h-4" />
            Delete Event
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdateLocationDialog
        inviteId={inviteId}
        currentLocation={currentLocation}
        currentMapLink={currentMapLink}
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
      />

      <DeleteInviteDialog
        inviteId={inviteId}
        inviteTitle={inviteTitle}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}
