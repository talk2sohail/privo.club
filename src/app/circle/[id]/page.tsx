import { auth } from "@/auth";
import { getCircle, getPendingMembers } from "@/app/actions/circles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Calendar,
	Users,
	ArrowLeft,
	MoreHorizontal,
	Plus,
	MapPin,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";
import Image from "next/image";
import { InviteMemberDialog } from "@/components/circle/InviteMemberDialog";
import { CircleSettingsMenu } from "@/components/circle/CircleSettingsMenu";
import { CreateInviteDialog } from "@/components/invites/create-invite-dialog";
import { PendingMembersList } from "@/components/circle/PendingMembersList";
import { MembersList } from "@/components/circle/MembersList";
import { MembersListDialog } from "@/components/circle/MembersListDialog";
import { MemberAvatarStack } from "@/components/circle/MemberAvatarStack";

interface CirclePageProps {
	params: Promise<{ id: string }>;
}

export default async function CirclePage({ params }: CirclePageProps) {
	const { id } = await params;
	const [session, circle] = await Promise.all([auth(), getCircle(id)]);

	if (!circle) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
				<div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center mb-6">
					<Users className="w-10 h-10 text-muted-foreground" />
				</div>
				<h1 className="text-4xl font-bold mb-4 tracking-tight">
					Hive Not Found
				</h1>
				<p className="text-muted-foreground mb-8 text-lg max-w-md">
					This hive doesn&#39;t exist or you don&#39;t have permission to view
					it.
				</p>
				<Link href="/">
					<Button className="rounded-full px-8" size="lg">
						Return Home
					</Button>
				</Link>
			</div>
		);
	}

	if (circle.currentUserStatus === "PENDING") {
		return (
			<main className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
				<div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-purple-500/20 blur-[120px] pointer-events-none rounded-full" />
				<div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />

				<div className="relative z-10 max-w-md w-full animate-fade-in-up">
					<div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-8 ring-1 ring-primary/20">
						<Users className="w-10 h-10" />
					</div>

					<h1 className="text-3xl font-bold mb-3 tracking-tight">
						Request Pending
					</h1>
					<p className="text-muted-foreground mb-10 text-lg leading-relaxed">
						Your request to join{" "}
						<span className="font-semibold text-foreground">{circle.name}</span>{" "}
						has been sent.
						<br />
						You'll be notified when the owner approves your request.
					</p>

					<div className="glass p-6 rounded-2xl mb-8 flex items-center gap-4 text-left hover:bg-white/5 transition-colors">
						<div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-white shadow-lg">
							{circle.owner.name?.charAt(0)}
						</div>
						<div>
							<p className="font-bold text-lg">{circle.owner.name}</p>
							<p className="text-sm text-primary font-medium">Hive Owner</p>
						</div>
					</div>

					<Link href="/">
						<Button
							variant="outline"
							className="rounded-full w-full h-12 text-base border-white/10 hover:bg-white/5 hover:text-white transition-all"
						>
							Back to Dashboard
						</Button>
					</Link>
				</div>
			</main>
		);
	}

	const isOwner = session?.user?.id === circle.ownerId;
	let pendingMembers: any[] = [];
	if (isOwner) {
		pendingMembers = await getPendingMembers(circle.id);
	}

	const hosts = circle.members.filter((m) => m.role === "OWNER");
	const regularMembers = circle.members.filter((m) => m.role !== "OWNER");

	return (
		<main className="min-h-screen bg-black text-white relative isolate overflow-x-hidden pb-32 selection:bg-purple-500/30">
			{/* Ambient Background */}
			<div className="fixed inset-0 min-h-screen pointer-events-none -z-10">
				<div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen opacity-50" />
				<div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen opacity-40" />
			</div>

			<div className="max-w-6xl mx-auto px-6 pt-10 relative z-10">
				{/* Navigation */}
				<nav className="flex items-center justify-between mb-12 animate-fade-in-up">
					<Link
						href="/"
						className="flex items-center gap-3 text-muted-foreground hover:text-white transition-all group py-2"
					>
						<div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/5 group-hover:border-white/20 group-hover:bg-white/10 transition-all">
							<ArrowLeft className="w-5 h-5" />
						</div>
						<span className="font-medium">Dashboard</span>
					</Link>
					<div className="flex gap-2">
						{isOwner && (
							<CircleSettingsMenu
								circleId={circle.id}
								circleName={circle.name}
							/>
						)}
					</div>
				</nav>

				{/* Hero Section */}
				<section className="mb-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 animate-fade-in-up delay-100">
					<div className="relative group">
						<div className="absolute -inset-4 bg-primary/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
						<div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
							<div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] bg-primary flex items-center justify-center text-5xl sm:text-6xl font-bold text-white shadow-2xl shadow-primary/40 ring-1 ring-white/10">
								{circle.name.charAt(0)}
							</div>
							<div>
								<h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-balance leading-[1.1] mb-3">
									{circle.name}
								</h1>
								<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground font-medium text-lg">
									<span className="flex items-center gap-2">
										<span className="w-2 h-2 rounded-full bg-purple-500" />
										Created by{" "}
										<span className="text-foreground">{circle.owner.name}</span>
									</span>
									<span className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />
									<span>
										{format(new Date(circle.createdAt), "MMMM d, yyyy")}
									</span>
								</div>
							</div>
						</div>
						{circle.description && (
							<p className="text-xl text-zinc-400 mt-8 max-w-3xl leading-relaxed text-balance">
								{circle.description}
							</p>
						)}
					</div>

					<div className="flex flex-wrap gap-4 w-full md:w-auto">
						{isOwner && (
							<CreateInviteDialog
								circles={[{ id: circle.id, name: circle.name }]}
								defaultCircleId={circle.id}
							>
								<Button
									size="lg"
									className="rounded-full h-14 px-8 font-bold shadow-lg shadow-primary/20 transition-all flex-1 md:flex-none"
								>
									<Plus className="w-5 h-5 mr-2" />
									New Event
								</Button>
							</CreateInviteDialog>
						)}

						<InviteMemberDialog
							circleId={circle.id}
							inviteCode={circle.inviteCode}
							isInviteLinkEnabled={circle.isInviteLinkEnabled}
							isOwner={isOwner}
						>
							<Button
								size="lg"
								variant="outline"
								className="rounded-full h-14 px-8 font-bold border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all flex-1 md:flex-none"
							>
								<Users className="w-5 h-5 mr-3" />
								Invite Members
							</Button>
						</InviteMemberDialog>
					</div>
				</section>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-fade-in-up delay-200">
					{/* Members Column - Takes up 4 columns on large screens */}
					<div className="lg:col-span-4 space-y-6">
						<div className="glass rounded-[2rem] overflow-hidden p-1 flex flex-col border-white/10 bg-black/40 h-fit">
							<div className="p-6 pb-2">
								<h3 className="text-xl font-bold flex items-center gap-2 mb-1">
									<Users className="w-5 h-5 text-purple-400" />
									Members
								</h3>
							</div>

							<CardContent className="p-4 pt-2 space-y-6">
								{/* Pending Members */}
								{isOwner && (
									<PendingMembersList
										members={pendingMembers}
										circleId={circle.id}
									/>
								)}

								{/* Hosts List */}
								<div>
									<h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 pl-2">
										Host
									</h4>
									<MembersList
										members={hosts}
										currentUserId={session?.user?.id}
										isOwner={isOwner}
										circleId={circle.id}
									/>
								</div>

								{/* Regular Members Avatar Stack */}
								{regularMembers.length > 0 && (
									<div>
										<h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 pl-2">
											Members
										</h4>
										<MemberAvatarStack
											members={regularMembers}
											circleId={circle.id}
											currentUserId={session?.user?.id}
											isOwner={isOwner}
										/>
									</div>
								)}
							</CardContent>
						</div>
					</div>

					{/* Events Column - Takes up 8 columns */}
					<div className="lg:col-span-8 space-y-6">
						<div className="flex items-center justify-between mb-2">
							<h3 className="text-2xl font-bold flex items-center gap-2">
								<Calendar className="w-6 h-6 text-blue-400" />
								Upcoming Events
							</h3>
						</div>

						{circle.invites.length === 0 ? (
							<div className="glass rounded-[2rem] p-12 text-center border-white/5 bg-white/5 flex flex-col items-center justify-center min-h-[300px]">
								<div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10">
									<Calendar className="w-10 h-10 text-muted-foreground/50" />
								</div>
								<h3 className="text-xl font-bold mb-2">No events yet</h3>
								<p className="text-muted-foreground max-w-sm mx-auto mb-8">
									Get the gathering started by creating the first event for this
									circle.
								</p>
								{isOwner && (
									<CreateInviteDialog
										circles={[{ id: circle.id, name: circle.name }]}
										defaultCircleId={circle.id}
									>
										<Button className="rounded-full h-12 px-6">
											Create Event
										</Button>
									</CreateInviteDialog>
								)}
							</div>
						) : (
							<div className="grid md:grid-cols-2 gap-4">
								{circle.invites.map((invite) => (
									<Link
										key={invite.id}
										href={`/event/${invite.id}`}
										className="group block h-full"
									>
										<div className="glass h-full p-5 rounded-[2rem] border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
											<div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity">
												<ArrowLeft className="w-5 h-5 rotate-[135deg] text-white/50" />
											</div>

											<div className="flex flex-col h-full justify-between gap-6">
												<div className="flex items-start justify-between">
													<div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/10 group-hover:border-purple-500/50 group-hover:bg-purple-500/10 transition-colors">
														<span className="text-xs text-purple-300 uppercase font-bold tracking-wider">
															{format(new Date(invite.eventDate), "MMM")}
														</span>
														<span className="text-2xl font-bold text-white">
															{format(new Date(invite.eventDate), "d")}
														</span>
													</div>
												</div>

												<div>
													<h4 className="font-bold text-xl mb-2 line-clamp-1 group-hover:text-purple-300 transition-colors">
														{invite.title}
													</h4>
													<div className="space-y-1.5">
														<p className="text-sm text-muted-foreground flex items-center gap-2">
															<Calendar className="w-4 h-4 text-zinc-500" />
															{format(
																new Date(invite.eventDate),
																"EEEE, h:mm a",
															)}
														</p>
														<p className="text-sm text-muted-foreground flex items-center gap-2">
															<MapPin className="w-4 h-4 text-zinc-500" />
															{invite.location || "Location TBD"}
														</p>
													</div>
												</div>

												<div className="pt-4 mt-2 border-t border-white/5 flex items-center justify-between">
													<div className="flex -space-x-3">
														{/* Placeholder for avatars, or could render rsvp count visually */}
														<div className="w-8 h-8 rounded-full bg-zinc-800 border border-black flex items-center justify-center text-[10px] font-bold">
															+{invite._count?.rsvps || 0}
														</div>
													</div>
													<span className="text-xs font-bold text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full group-hover:bg-white/10 transition-colors">
														View Details
													</span>
												</div>
											</div>
										</div>
									</Link>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</main>
	);
}
