"use client";

import { useState } from "react";
import { createFeedItem } from "@/app/actions/feed";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function PostUpdateDialog({ inviteId }: { inviteId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const content = formData.get("content") as string;

    try {
      await createFeedItem(inviteId, content);
      toast.success("Update posted to feed!");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to post update.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-primary font-bold">
          Add Update
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass border-white/20 text-foreground backdrop-blur-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Post Event Update
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            This will be visible to all guests in the event feed.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <Textarea
            name="content"
            placeholder="e.g., We've moved to a different picnic spot near the lake!"
            required
            className="min-h-[120px] border-white/10 bg-white/5 focus-visible:ring-primary"
          />
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-lg font-bold rounded-xl"
            >
              {loading ? "Posting..." : "Post Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
