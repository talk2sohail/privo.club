"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCircle } from "@/app/actions/circles";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function CreateCircleDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    try {
      await createCircle(formData);
      toast.success("Circle created successfully!");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to create circle. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="secondary"
          className="rounded-2xl px-6 h-14 text-lg font-semibold border-border glass hover:bg-white/5 transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          My Circles
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass border-white/20 text-foreground backdrop-blur-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Create Circle of Trust
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a name and description for your group. You can invite members
            later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Circle Name
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Family, Close Friends"
              required
              className="h-12 border-white/10 bg-white/5 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Description (Optional)
            </Label>
            <Input
              id="description"
              name="description"
              placeholder="What's this group for?"
              className="h-12 border-white/10 bg-white/5 focus-visible:ring-primary"
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20"
            >
              {loading ? "Creating..." : "Create Circle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
