"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Plus } from "lucide-react"
import { createInvite } from "@/app/actions/invites"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface CreateInviteDialogProps {
  circles: { id: string; name: string }[]
}

export function CreateInviteDialog({ circles }: CreateInviteDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date>()
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!date) {
      toast.error("Please select an event date")
      return
    }

    setLoading(true)
    const formData = new FormData(event.currentTarget)
    formData.append("eventDate", date.toISOString())

    try {
      const invite = await createInvite(formData)
      toast.success("Invite sent successfully!")
      setOpen(false)
      router.refresh()
      // Optional: redirect to invite page
      // router.push(`/event/${invite.id}`)
    } catch (error) {
      toast.error("Failed to create invite. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-2xl px-6 h-14 text-lg font-semibold gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-[0.98]">
          <Plus className="w-5 h-5" />
          New Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] glass border-white/20 text-foreground backdrop-blur-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Invite</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the details for your special occasion.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">Event Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Sarah's Birthday Dinner"
              required
              className="h-12 border-white/10 bg-white/5 focus-visible:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full h-12 justify-start text-left font-normal border-white/10 bg-white/5 hover:bg-white/10 transition-all",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 glass border-white/20 backdrop-blur-3xl">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="bg-transparent"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="circleId" className="text-sm font-semibold">Send to Circle</Label>
              <Select name="circleId">
                <SelectTrigger className="h-12 border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                  <SelectValue placeholder="Select a circle" />
                </SelectTrigger>
                <SelectContent className="glass border-white/20 backdrop-blur-3xl">
                  {circles.map((circle) => (
                    <SelectItem key={circle.id} value={circle.id}>
                      {circle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-semibold">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g., Central Park, NYC"
              className="h-12 border-white/10 bg-white/5 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
            <Input
              id="description"
              name="description"
              placeholder="Tell them more about the event..."
              className="h-12 border-white/10 bg-white/5 focus-visible:ring-primary"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
              {loading ? "Creating..." : "Send Invitations"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
