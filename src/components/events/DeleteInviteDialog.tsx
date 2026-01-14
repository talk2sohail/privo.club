"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteInvite } from "@/app/actions/invites";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteInviteDialogProps {
  inviteId: string;
  inviteTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteInviteDialog({
  inviteId,
  inviteTitle,
  open,
  onOpenChange,
}: DeleteInviteDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteInvite(inviteId);
      toast.success("Event deleted successfully");
      if (result.circleId) {
          router.push(`/circle/${result.circleId}`);
      } else {
          router.push("/");
      }
    } catch (error) {
        console.error(error);
      toast.error("Failed to delete event");
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-zinc-900 border-white/10 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this event?</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            This action cannot be undone. This will permanently delete 
            <span className="font-bold text-white"> {inviteTitle} </span>
            and remove all RSVPs, posts, and media.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
                e.preventDefault();
                handleDelete();
            }}
            className="bg-red-600 hover:bg-red-700 text-white border-0"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Event"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
