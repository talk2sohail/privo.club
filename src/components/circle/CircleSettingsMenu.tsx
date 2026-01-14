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
import { DeleteCircleDialog } from "./DeleteCircleDialog";

interface CircleSettingsMenuProps {
  circleId: string;
  circleName: string;
}

export function CircleSettingsMenu({ circleId, circleName }: CircleSettingsMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border border-white/5 glass"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 text-white">
          <DropdownMenuLabel>Settings</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer flex items-center gap-2"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="w-4 h-4" />
            Delete Circle
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteCircleDialog
        circleId={circleId}
        circleName={circleName}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}
