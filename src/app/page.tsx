import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getMyCircles } from "@/app/actions/circles";
import { getMyInvites } from "@/app/actions/invites";
import { InviteWithRelations, CirclePreview } from "@/types";
import Image from "next/image";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Suspense } from "react";
import { HeroSection } from "@/components/dashboard/hero-section";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { CirclesList } from "@/components/dashboard/circles-list";
import { InvitesList } from "@/components/dashboard/invites-list";
import {
  HeroSkeleton,
  StatsSkeleton,
  CirclesSkeleton,
  InvitesSkeleton,
} from "@/components/skeletons";

export default async function Home() {
  const session = await auth();



  if (!session?.user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Privo.club</h1>
        <p className="text-muted-foreground mb-8">
          Celebrate moments that matter with your close ones.
        </p>
        <Link href="/auth/signin">
          <Button size="lg" className="rounded-full px-8">
            Sign In to Continue
          </Button>
        </Link>
      </main>
    );
  }

  // Initiate data fetching in parallel (don't await here!)
  const circlesPromise = getMyCircles() as Promise<CirclePreview[]>;
  const invitesPromise = getMyInvites() as Promise<InviteWithRelations[]>;

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute top-0 left-0 w-full h-full gradient-blur opacity-60 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-16 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 bg-linear-to-br from-primary to-primary/80">
              <span className="text-xl font-bold text-white">P</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Privo<span className="bg-primary px-2 py-0.5 rounded-md ml-0.5">.club</span>
            </h1>
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
            <SignOutButton
              signOutAction={async () => {
                "use server";
                const { signOut } = await import("@/auth");
                await signOut({ redirectTo: "/" });
              }}
            />
          </div>
        </header>

        {/* Hero Section */}
        <section className="mb-20 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 animate-fade-in-up delay-100">
          <div className="w-full sm:w-auto">
            <Suspense fallback={<HeroSkeleton />}>
              <HeroSection
                circlesPromise={circlesPromise}
                userId={session.user.id!}
              />
            </Suspense>
          </div>

          {/* Stats Cards Concept */}
          <Suspense fallback={<StatsSkeleton />}>
            <StatsCards
              circlesPromise={circlesPromise}
              invitesPromise={invitesPromise}
            />
          </Suspense>
        </section>

        {/* Circles & Invites Grid */}
        <div className="grid md:grid-cols-2 gap-12 animate-fade-in-up delay-200">
          {/* My Circles */}
          <Suspense fallback={<CirclesSkeleton />}>
            <CirclesList
              circlesPromise={circlesPromise}
              userId={session.user.id!}
            />
          </Suspense>

          {/* Recent Invites */}
          <Suspense fallback={<InvitesSkeleton />}>
            <InvitesList
              invitesPromise={invitesPromise}
              circlesPromise={circlesPromise}
              userId={session.user.id!}
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
