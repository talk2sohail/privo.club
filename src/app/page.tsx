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
import { Users, Calendar, MessageSquare } from "lucide-react";
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
			<main className="min-h-screen bg-background relative overflow-hidden">
				{/* Background gradients */}
				<div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-primary/20 blur-[120px] pointer-events-none" />
				<div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-blue-500/10 blur-[100px] pointer-events-none" />

				<div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
					{/* Header */}
					<header className="flex items-center justify-between mb-12 animate-fade-in-up">
						<h1 className="text-2xl font-bold tracking-tight">
							<span className="text-3xl">P</span>rivo
							<span className="bg-primary px-2 py-0.5 rounded-2xl ml-1">
								.club
							</span>
						</h1>
					</header>

					{/* Hero Section */}
					<section className="text-center mb-32 animate-fade-in-up delay-100">
						<div className="flex justify-center mb-8">
							<div className="relative">
								<div className="absolute -inset-6 bg-primary/20 rounded-full blur-3xl opacity-60" />
								<Image
									src="/icons/icon-192.png"
									alt="Privo.club"
									width={120}
									height={120}
									className="rounded-2xl relative z-10 shadow-2xl"
								/>
							</div>
						</div>
						<h2 className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1]">
							<span className="text-foreground text-balance block">
								Your moments.
							</span>
							<span className="text-foreground text-balance block">
								Your People.
							</span>
						</h2>
						<p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
							Celebrate life's special moments with the people who matter most.
							No noise. No strangers. Just your close ones.
						</p>
						<Link href="/auth/signin">
							<Button
								size="lg"
								className="rounded-full px-12 h-16 text-lg font-bold shadow-2xl shadow-primary/30 hover:scale-105 transition-transform"
							>
								Get Started
							</Button>
						</Link>
					</section>

					{/* Features with Scroll Appeal */}
					<section className="space-y-40 mb-32 animate-fade-in-up delay-200">
						{/* Problem/Solution Hook */}
						<div className="text-center">
							<div className="inline-block px-6 py-3 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 mb-8 text-sm font-bold uppercase tracking-wide">
								The Problem
							</div>
							<h3 className="text-5xl sm:text-6xl font-extrabold mb-6 text-muted-foreground line-through opacity-60">
								Social media is broken
							</h3>
							<p className="text-xl text-muted-foreground/70 max-w-2xl mx-auto mb-12">
								Your birthday post gets lost in a feed of strangers. Your close
								friends see ads instead of your invite.
							</p>
							<div className="inline-block px-6 py-3 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-sm font-bold uppercase tracking-wide">
								The Solution ↓
							</div>
						</div>

						{/* Feature 1 */}
						<div className="grid md:grid-cols-2 gap-16 items-center">
							<div className="order-2 md:order-1">
								<div className="relative h-[350px] rounded-[3rem] overflow-hidden glass border-white/10 bg-gradient-to-br from-purple-900/50 to-purple-600/50 group">
									<div className="absolute inset-0 flex items-center justify-center">
										<div className="relative">
											<div className="absolute -inset-8 bg-purple-500/40 rounded-full blur-3xl group-hover:blur-4xl transition-all duration-700" />
											<Users className="w-40 h-40 text-white relative z-10 group-hover:scale-110 transition-transform duration-700" />
										</div>
									</div>
									{/* Floating avatars */}
									<div className="absolute top-10 left-10 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold shadow-2xl animate-float">
										M
									</div>
									<div className="absolute top-24 right-14 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-2xl animate-float delay-100">
										J
									</div>
									<div className="absolute bottom-16 left-20 w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-xl font-bold shadow-2xl animate-float delay-200">
										S
									</div>
								</div>
							</div>
							<div className="order-1 md:order-2">
								<div className="inline-block px-5 py-2.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 mb-6 text-sm font-bold">
									🔒 Private by Default
								</div>
								<h3 className="text-5xl sm:text-6xl font-extrabold mb-8 leading-[1.1]">
									Only your people.
									<br />
									<span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
										No randos.
									</span>
								</h3>
								<p className="text-xl text-muted-foreground leading-relaxed mb-8">
									Create invite-only hives. Every person is hand-picked by you.
									No algorithms deciding who sees your moments.
								</p>
								<div className="flex items-center gap-4 text-base">
									<div className="flex -space-x-3">
										<div className="w-10 h-10 rounded-full bg-purple-500 border-4 border-background shadow-lg" />
										<div className="w-10 h-10 rounded-full bg-pink-500 border-4 border-background shadow-lg" />
										<div className="w-10 h-10 rounded-full bg-blue-500 border-4 border-background shadow-lg" />
										<div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-4 border-background shadow-lg flex items-center justify-center text-white text-xs font-bold">
											+12
										</div>
									</div>
									<span className="text-muted-foreground font-medium">
										Your circle. Your rules.
									</span>
								</div>
							</div>
						</div>

						{/* Feature 2 */}
						<div className="grid md:grid-cols-2 gap-16 items-center">
							<div>
								<div className="inline-block px-5 py-2.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 mb-6 text-sm font-bold">
									✨ Beautiful & Simple
								</div>
								<h3 className="text-5xl sm:text-6xl font-extrabold mb-8 leading-[1.1]">
									Invites that feel
									<br />
									<span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
										special.
									</span>
								</h3>
								<p className="text-xl text-muted-foreground leading-relaxed mb-8">
									No more boring text messages. Create stunning invitations in
									seconds. Track who's coming, who's not—all in one place.
								</p>
								<div className="space-y-4">
									<div className="flex items-center gap-4">
										<div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center ring-2 ring-blue-500/30">
											<span className="text-blue-400 font-bold">✓</span>
										</div>
										<span className="text-muted-foreground text-lg">
											Live RSVP tracking
										</span>
									</div>
									<div className="flex items-center gap-4">
										<div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center ring-2 ring-blue-500/30">
											<span className="text-blue-400 font-bold">✓</span>
										</div>
										<span className="text-muted-foreground text-lg">
											Automatic reminders
										</span>
									</div>
									<div className="flex items-center gap-4">
										<div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center ring-2 ring-blue-500/30">
											<span className="text-blue-400 font-bold">✓</span>
										</div>
										<span className="text-muted-foreground text-lg">
											Share event updates
										</span>
									</div>
								</div>
							</div>
							<div>
								<div className="relative h-[350px] rounded-[3rem] overflow-hidden glass border-white/10 bg-gradient-to-br from-blue-900/50 to-cyan-600/50 group">
									<div className="absolute inset-0 flex items-center justify-center">
										<div className="relative">
											<div className="absolute -inset-8 bg-blue-500/40 rounded-full blur-3xl group-hover:blur-4xl transition-all duration-700" />
											<Calendar className="w-40 h-40 text-white relative z-10 group-hover:rotate-12 transition-transform duration-700" />
										</div>
									</div>
									{/* Floating date badges */}
									<div className="absolute top-12 right-12 px-5 py-3 rounded-2xl bg-white/25 backdrop-blur-xl text-white text-lg font-bold shadow-2xl animate-float border border-white/20">
										Feb 14
									</div>
									<div className="absolute bottom-16 left-12 px-5 py-3 rounded-2xl bg-white/25 backdrop-blur-xl text-white text-lg font-bold shadow-2xl animate-float delay-150 border border-white/20">
										8:00 PM
									</div>
									<div className="absolute top-1/2 left-12 px-4 py-2 rounded-xl bg-green-500/30 backdrop-blur-xl text-green-200 text-sm font-bold shadow-xl animate-float delay-100 border border-green-400/30">
										12 Going
									</div>
								</div>
							</div>
						</div>

						{/* Feature 3 */}
						<div className="grid md:grid-cols-2 gap-16 items-center">
							<div className="order-2 md:order-1">
								<div className="relative h-[350px] rounded-[3rem] overflow-hidden glass border-white/10 bg-gradient-to-br from-pink-900/50 to-rose-600/50 group">
									<div className="absolute inset-0 flex items-center justify-center">
										<div className="relative">
											<div className="absolute -inset-8 bg-pink-500/40 rounded-full blur-3xl group-hover:blur-4xl transition-all duration-700" />
											<MessageSquare className="w-40 h-40 text-white relative z-10 group-hover:scale-110 transition-transform duration-700" />
										</div>
									</div>
									{/* Floating notification dots */}
									<div className="absolute top-1/4 right-16 w-5 h-5 rounded-full bg-green-400 shadow-2xl shadow-green-400/60 animate-pulse ring-4 ring-green-400/20" />
									<div className="absolute top-1/3 left-16 w-4 h-4 rounded-full bg-blue-400 shadow-2xl shadow-blue-400/60 animate-pulse delay-100 ring-4 ring-blue-400/20" />
									<div className="absolute bottom-1/3 right-20 w-4 h-4 rounded-full bg-purple-400 shadow-2xl shadow-purple-400/60 animate-pulse delay-200 ring-4 ring-purple-400/20" />
								</div>
							</div>
							<div className="order-1 md:order-2">
								<div className="inline-block px-5 py-2.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/30 mb-6 text-sm font-bold">
									💫 Keep the Magic Alive
								</div>
								<h3 className="text-5xl sm:text-6xl font-extrabold mb-8 leading-[1.1]">
									After-party
									<br />
									<span className="bg-linear-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
										memories.
									</span>
								</h3>
								<p className="text-xl text-muted-foreground leading-relaxed mb-8">
									Share photos, reactions, and inside jokes—all in your private
									hive. No public feeds. No strangers commenting.
								</p>
								<div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-pink-500/10 border border-pink-500/20">
									<span className="text-3xl">🔒</span>
									<span className="text-pink-300 font-semibold text-lg">
										Your moments stay yours
									</span>
								</div>
							</div>
						</div>
					</section>

					{/* Social Proof */}
					<section className="mb-32">
						<div className="text-center mb-16">
							<div className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 mb-8 text-sm font-bold uppercase tracking-wide">
								Join the Movement
							</div>
							<h3 className="text-5xl sm:text-6xl font-extrabold mb-6">
								Social media for humans,
								<br />
								<span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
									not algorithms.
								</span>
							</h3>
						</div>

						<div className="grid md:grid-cols-3 gap-8">
							<div className="glass rounded-3xl p-10 border-white/10 text-center hover:scale-105 hover:border-purple-500/30 transition-all duration-300">
								<div className="text-6xl font-extrabold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
									100%
								</div>
								<p className="text-lg text-muted-foreground font-medium">
									Private & Secure
								</p>
							</div>
							<div className="glass rounded-3xl p-10 border-white/10 text-center hover:scale-105 hover:border-blue-500/30 transition-all duration-300">
								<div className="text-6xl font-extrabold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
									0
								</div>
								<p className="text-lg text-muted-foreground font-medium">
									Ads Forever
								</p>
							</div>
							<div className="glass rounded-3xl p-10 border-white/10 text-center hover:scale-105 hover:border-pink-500/30 transition-all duration-300">
								<div className="text-6xl font-extrabold bg-linear-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-3">
									∞
								</div>
								<p className="text-lg text-muted-foreground font-medium">
									Meaningful Moments
								</p>
							</div>
						</div>
					</section>

					{/* CTA Section - Redesigned */}
					<section className="text-center animate-fade-in-up delay-300 mb-32">
						<div className="relative group">
							<div className="absolute -inset-4 bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-blue-500/30 rounded-[4rem] blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
							<div className="relative glass rounded-[3rem] p-12 sm:p-16 border-white/10 bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-2xl overflow-hidden">
								{/* Animated background particles */}
								<div className="absolute inset-0 opacity-20">
									<div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-pulse" />
									<div className="absolute top-20 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-100" />
									<div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse delay-200" />
									<div className="absolute bottom-20 right-1/3 w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-300" />
								</div>

								<div className="relative z-10">
									<h3 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 tracking-tight bg-linear-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
										Your hive awaits
									</h3>
									<p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
										Stop broadcasting to strangers. Start celebrating with the
										people who actually matter.
									</p>
									<Link href="/auth/signin">
										<Button
											size="lg"
											className="
												rounded-full 
												px-6 sm:px-12 md:px-16 
												h-12 sm:h-14 md:h-16 
												text-sm sm:text-base md:text-lg 
												font-bold 
												shadow-xl md:shadow-2xl 
												shadow-primary/40 
												hover:scale-105 
												active:scale-95 
												transition-all 
												duration-300 
												group-hover:shadow-purple-500/60
												whitespace-nowrap
											"
										>
											Get Started Free
											<span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">
												→
											</span>
										</Button>
									</Link>
									<p className="mt-6 text-sm text-muted-foreground/70">
										No credit card required • Set up in minutes
									</p>
								</div>
							</div>
						</div>
					</section>

					{/* Footer */}
					<footer className="mt-32 pt-12 border-t border-white/5 text-center text-muted-foreground text-sm">
						<div className="flex flex-col items-center gap-4 mb-8">
							<Image
								src="/icons/icon-192.png"
								alt="Privo.club"
								width={48}
								height={48}
								className="rounded-lg opacity-80"
							/>
							<div className="font-bold text-base">
								Privo
								<span className="bg-primary px-1.5 py-0.5 rounded-xl ml-1 text-sm">
									.club
								</span>
							</div>
						</div>
						<p>© 2026 Privo.club. Celebrate moments that matter.</p>
					</footer>
				</div>
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
					<h1 className="text-2xl font-bold tracking-tight">
						<span className="text-3xl">P</span>rivo
						<span className="bg-primary px-2 py-0.5 rounded-2xl ml-1">
							.club
						</span>
					</h1>
					<div className="flex items-center gap-4">
						<div className="hidden sm:block text-right">
							<p className="text-sm font-medium leading-none mb-1">
								{session.user.name}
							</p>
							<p className="text-xs text-muted-foreground">
								{session.user.email}
							</p>
						</div>
						<Link href="/profile" className="w-10 h-10 rounded-full bg-secondary border border-border overflow-hidden relative hover:ring-2 hover:ring-primary transition-all">
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
						</Link>
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

				{/* Hives & Invites Grid */}
				<div className="grid md:grid-cols-2 gap-12 animate-fade-in-up delay-200">
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
