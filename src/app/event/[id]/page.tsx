import { auth } from "@/auth";
import { getInvite } from "@/app/actions/invites";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Users,
  Share2,
  Clock,
  MessageSquare,
  Image as ImageIcon,
  ArrowLeft,
  Check,
  X,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { RsvpButtons } from "@/components/events/rsvp-buttons";
import { PostUpdateDialog } from "@/components/events/post-update-dialog";
import { EventSettingsMenu } from "@/components/events/EventSettingsMenu";
import { MemoryVault } from "@/components/events/MemoryVault";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  const [session, invite] = await Promise.all([auth(), getInvite(id)]);

  if (!invite) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Event Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The invite you &#39;re looking for doesn&#39;t exist or has been
          removed.
        </p>
        <Link href="/">
          <Button className="rounded-full">Return Home</Button>
        </Link>
      </div>
    );
  }

  const isOwner = session?.user?.id === invite.senderId;
  const myRsvp = invite.rsvps.find((r) => r.userId === session?.user?.id);

  return (
    <main className="min-h-screen bg-background relative overflow-hidden pb-20">
      {/* Background radial gradients */}
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-linear-to-b from-primary/10 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 pt-12 relative z-10">
        <nav className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-white/5 glass hover:scale-110 transition-transform"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            {isOwner && (
                <EventSettingsMenu 
                  inviteId={invite.id} 
                  inviteTitle={invite.title}
                  currentLocation={invite.location || ""}
                  currentMapLink={invite.mapLink}
                />
            )}
          </div>
        </nav>

        {/* Event Header Card */}
        <section className="mb-12">
          <div className="relative aspect-21/9 rounded-[2.5rem] overflow-hidden mb-8 border border-white/10 shadow-2xl group">
            <div className="absolute inset-0 bg-linear-to-br from-primary/40 to-blue-600/40 mix-blend-overlay group-hover:opacity-80 transition-opacity z-10" />
            <Image
              src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80"
              alt="Event Cover"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                  {invite.circle?.name || "Personal Invite"}
                </span>
                {isOwner && (
                  <span className="px-3 py-1 rounded-full bg-primary/40 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                    You are the Host
                  </span>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight drop-shadow-xl">
                {invite.title}
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div className="glass p-8 rounded-[2.5rem] border-white/10 shadow-lg">
                <h3 className="text-xl font-bold mb-6">Event Details</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">
                        {format(
                          new Date(invite.eventDate),
                          "EEEE, d MMMM yyyy",
                        )}
                      </p>
                      <p className="text-muted-foreground">
                        {format(new Date(invite.eventDate), "h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/10">
                      <MapPin className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-lg">
                          {invite.location || "Online / TBD"}
                        </p>
                        {invite.mapLink && (
                          <a 
                            href={invite.mapLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg font-bold uppercase tracking-wider hover:bg-blue-500/30 transition-colors"
                          >
                            Open in Maps
                          </a>
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        Location details for guests
                      </p>
                    </div>
                  </div>
                </div>
                {invite.description && (
                  <div className="mt-8 pt-8 border-t border-white/5">
                    <p className="text-muted-foreground leading-relaxed text-lg italic">
                      {invite.description}
                    </p>
                  </div>
                )}
              </div>

              {/* RSVP Section for Guests */}
              {!isOwner && (
                <div className="glass p-8 rounded-[2.5rem] border-primary/20 bg-primary/5 shadow-inner">
                  <h3 className="text-xl font-bold mb-6">
                    Are you joining us?
                  </h3>
                  <RsvpButtons inviteId={id} myRsvpStatus={myRsvp?.status} />
                </div>
              )}

              {/* Event Feed */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-2xl font-bold">Event Updates</h3>
                  {isOwner && <PostUpdateDialog inviteId={id} />}
                </div>

                {invite.feedItems.length === 0 ? (
                  <div className="glass p-12 rounded-[2.5rem] border-dashed border-white/10 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">
                      No updates have been posted yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invite.feedItems.map((item) => (
                      <div
                        key={item.id}
                        className="glass p-6 rounded-3xl border-white/5 animate-in fade-in slide-in-from-top-2 duration-500"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          {item.user.image ? (
                            <Image
                              src={item.user.image}
                              alt={item.user.name || "User"}
                              width={32}
                              height={32}
                              className="rounded-full border border-white/10"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full border border-white/10 bg-muted flex items-center justify-center font-bold text-xs">
                              {item.user.name?.[0]}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-bold">
                                {item.user.name}
                              </p>
                              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                                Host Update
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              {format(new Date(item.createdAt), "PPp")}
                            </p>
                          </div>
                        </div>
                        <p className="text-base text-foreground/90 leading-relaxed font-medium">
                          {item.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <aside className="space-y-8">
              <Card className="rounded-[2.5rem] glass border-white/10 overflow-hidden shadow-xl">
                <CardHeader className="pb-4 bg-white/5 border-b border-white/5">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Guest List
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-green-500/10 rounded-2xl p-3 border border-green-500/10">
                      <p className="font-bold text-2xl text-green-500">
                        {invite.rsvps.filter((r) => r.status === "YES").length}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                        Going
                      </p>
                    </div>
                    <div className="bg-yellow-500/10 rounded-2xl p-3 border border-yellow-500/10">
                      <p className="font-bold text-2xl text-yellow-500">
                        {
                          invite.rsvps.filter((r) => r.status === "MAYBE")
                            .length
                        }
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                        Maybe
                      </p>
                    </div>
                    <div className="bg-red-500/10 rounded-2xl p-3 border border-red-500/10">
                      <p className="font-bold text-2xl text-red-500">
                        {invite.rsvps.filter((r) => r.status === "NO").length}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                        Out
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-75 overflow-y-auto pr-2 custom-scrollbar">
                    {invite.rsvps.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Waiting for responses...
                      </p>
                    ) : (
                      invite.rsvps.map((rsvp) => (
                        <div
                          key={rsvp.id}
                          className="flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10">
                              {rsvp.user.image ? (
                                <Image
                                  src={rsvp.user.image}
                                  alt={rsvp.user.name || "User"}
                                  fill
                                  className="rounded-full border border-white/10 object-cover group-hover:scale-110 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full rounded-full border border-white/10 bg-muted flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                                  {rsvp.user.name?.[0]}
                                </div>
                              )}
                              <div
                                className={cn(
                                  "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center z-10",
                                  rsvp.status === "YES"
                                    ? "bg-green-500"
                                    : rsvp.status === "NO"
                                      ? "bg-red-500"
                                      : "bg-yellow-500",
                                )}
                              >
                                {rsvp.status === "YES" && (
                                  <Check className="w-2.5 h-2.5 text-white stroke-4" />
                                )}
                                {rsvp.status === "NO" && (
                                  <X className="w-2.5 h-2.5 text-white stroke-4" />
                                )}
                                {rsvp.status === "MAYBE" && (
                                  <Clock className="w-2.5 h-2.5 text-white stroke-4" />
                                )}
                              </div>
                            </div>
                            <span className="text-sm font-bold">
                              {rsvp.user.name}
                            </span>
                          </div>
                          {rsvp.guestCount > 1 && (
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              +{rsvp.guestCount - 1} Guests
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <MemoryVault invite={invite} />

              <div className="p-4 text-center">
                <p className="text-[10px] text-muted-foreground font-medium">
                  Host: {invite.sender.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Original Invite sent via Privo.club
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
