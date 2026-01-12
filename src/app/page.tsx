import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Sparkles, CircleUser } from "lucide-react";
import Link from "next/link";
import { CreateCircleDialog } from "@/components/circles/create-circle-dialog";
import { getMyCircles } from "@/app/actions/circles";
import { CreateInviteDialog } from "@/components/invites/create-invite-dialog";
import { getMyInvites } from "@/app/actions/invites-fetch";
import { EmptyState } from "@/components/ui/empty-state";
import { InviteWithRelations, CircleWithRelations } from "@/types";
import Image from "next/image";

export default async function Home() {
  const [session, circlesData, invitesData] = await Promise.all([
    auth(),
    getMyCircles(),
    getMyInvites(),
  ]);

  // Explicitly cast the return types to avoid inference issues or strict null checks on the array
  const circles = circlesData as unknown as CircleWithRelations[];
  const invites = invitesData as unknown as InviteWithRelations[];

  if (!session?.user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Invito</h1>
        <p className="text-muted-foreground mb-8">
          Manage your events and circles in one place.
        </p>
        <Link href="/auth/signin">
          <Button size="lg" className="rounded-full px-8">
            Sign In to Continue
          </Button>
        </Link>
      </main>
    );
  }

  const upcomingInvites = invites.filter(
    (i) => new Date(i.eventDate) > new Date(),
  );

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute top-0 left-0 w-full h-full gradient-blur opacity-50 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-16 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 bg-linear-to-br from-primary to-primary/80">
              <span className="text-xl font-bold text-white">i</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Invito</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium leading-none mb-1">
                {session.user.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {session.user.email}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary border border-border overflow-hidden relative">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-muted-foreground font-bold">
                    {session.user.name?.[0]}
                  </span>
                </div>
              )}
            </div>
            <form
              action={async () => {
                "use server";
                const { signOut } = await import("@/auth");
                await signOut();
              }}
            >
              <Button
                variant="outline"
                size="sm"
                className="ml-2 rounded-full border-white/10 hover:bg-white/5"
              >
                Sign Out
              </Button>
            </form>
          </div>
        </header>

        {/* Hero Section */}
        <section className="mb-20 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 animate-fade-in-up delay-100">
          <div>
            <h2 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              <span className="bg-linear-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
                Celebrate moments
                <br className="hidden sm:block" /> that matter.
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Organize gatherings, manage your close circles, and creating
              lasting memories without the chaos.
            </p>
            <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
              <CreateInviteDialog circles={circles} />
              <CreateCircleDialog />
            </div>
          </div>

          {/* Stats Cards Concept */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="glass p-6 rounded-3xl aspect-square flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-3xl font-bold">{upcomingInvites.length}</p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
            </div>
            <div className="glass p-6 rounded-3xl aspect-square flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                <CircleUser className="w-5 h-5" />
              </div>
              <div>
                <p className="text-3xl font-bold">{circles.length}</p>
                <p className="text-sm text-muted-foreground">Circles</p>
              </div>
            </div>
          </div>
        </section>

        {/* Circles & Invites Grid */}
        <div className="grid md:grid-cols-2 gap-12 animate-fade-in-up delay-200">
          {/* My Circles */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" /> My Circles
              </h3>
              {circles.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                >
                  View All
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {circles.length === 0 ? (
                <EmptyState
                  icon={CircleUser}
                  title="No circles yet"
                  description="Create a circle to group your friends and family for easy invites."
                  actionComponent={<CreateCircleDialog />}
                />
              ) : (
                circles.map((circle) => (
                  <Link
                    key={circle.id}
                    href={`/circle/${circle.id}`}
                    className="block"
                  >
                    <div className="glass p-5 rounded-3xl border-white/5 hover:border-primary/20 hover:bg-white/5 transition-all cursor-pointer flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-xl font-bold text-primary">
                          {circle.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg group-hover:text-primary transition-colors">
                            {circle.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {circle._count.members} Members
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Recent Invites */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" /> Recent Invites
              </h3>
              {invites.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                >
                  View All
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {invites.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No upcoming events"
                  description="You have no upcoming events. Plan something fun!"
                  actionComponent={<CreateInviteDialog circles={circles} />}
                />
              ) : (
                invites.map((invite) => (
                  <Link
                    key={invite.id}
                    href={`/event/${invite.id}`}
                    className="block"
                  >
                    <div className="glass p-5 rounded-3xl border-white/5 hover:border-blue-500/30 hover:bg-white/5 transition-all cursor-pointer flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-2xl">
                          {invite.title.toLowerCase().includes("birthday")
                            ? "🎂"
                            : "🎉"}
                        </div>
                        <div>
                          <h4 className="font-bold group-hover:text-blue-400 transition-colors">
                            {invite.title}
                          </h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                            {new Date(invite.eventDate).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric" },
                            )}
                            <span className="opacity-50">•</span>
                            {invite.circle ? invite.circle.name : "Personal"}
                          </p>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-4">
                        <div className="flex -space-x-2">
                          {/* This would be real avatars in a real app */}
                          <div className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[9px] font-bold">
                            {invite._count.rsvps}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
