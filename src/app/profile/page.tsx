import { auth } from "@/auth";
import { getUserProfile } from "@/app/actions/user";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileStatsCards } from "@/components/profile/profile-stats-cards";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Globe, Lock, Users } from "lucide-react";

export default async function ProfilePage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/auth/signin");
	}

	const userId = session.user.id;
	const profileData = await getUserProfile(userId);

	if (!profileData) {
		return (
			<div className="min-h-screen bg-background">
				<div className="max-w-6xl mx-auto px-6 py-8">
					<p className="text-muted-foreground">Failed to load profile</p>
				</div>
			</div>
		);
	}

	const getInitials = (name?: string) => {
		if (!name) return "U";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const visibilityIcon = {
		PUBLIC: <Globe className="h-4 w-4" />,
		PRIVATE: <Lock className="h-4 w-4" />,
		CIRCLES_ONLY: <Users className="h-4 w-4" />,
	}[profileData.profileVisibility || "PUBLIC"];

	const visibilityLabel = {
		PUBLIC: "Public",
		PRIVATE: "Private",
		CIRCLES_ONLY: "Circles Only",
	}[profileData.profileVisibility || "PUBLIC"];

	return (
		<div className="min-h-screen bg-background">
			{/* Background gradients */}
			<div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-primary/20 blur-[120px] pointer-events-none" />
			<div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-blue-500/10 blur-[100px] pointer-events-none" />

			<div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
				{/* Profile Header Card */}
				<Card className="mb-8">
					<CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
						<div className="flex items-center gap-4">
							<Avatar className="h-20 w-20">
								<AvatarImage src={profileData.image || ""} alt={profileData.name || "User"} />
								<AvatarFallback className="text-2xl">
									{getInitials(profileData.name)}
								</AvatarFallback>
							</Avatar>
							<div>
								<div className="flex items-center gap-2 mb-1">
									<h1 className="text-2xl font-bold">
										{profileData.name || "Anonymous User"}
									</h1>
									<Badge variant="outline" className="flex items-center gap-1">
										{visibilityIcon}
										<span className="text-xs">{visibilityLabel}</span>
									</Badge>
								</div>
								{profileData.email && (
									<p className="text-sm text-muted-foreground">
										{profileData.email}
									</p>
								)}
								{profileData.createdAt && (
									<div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
										<CalendarDays className="h-3 w-3" />
										<span>
											Joined{" "}
											{new Date(profileData.createdAt).toLocaleDateString()}
										</span>
									</div>
								)}
							</div>
						</div>
						<EditProfileDialog
							userId={userId}
							currentName={profileData.name || undefined}
							currentBio={profileData.bio || undefined}
							currentVisibility={profileData.profileVisibility}
						/>
					</CardHeader>
					{profileData.bio && (
						<CardContent>
							<p className="text-sm text-muted-foreground whitespace-pre-wrap">
								{profileData.bio}
							</p>
						</CardContent>
					)}
				</Card>

				{/* Stats Section */}
				<div className="mb-8">
					<h2 className="text-lg font-semibold mb-4">Your Activity</h2>
					<ProfileStatsCards stats={profileData.stats} />
				</div>

				{/* Activity Timeline Placeholder */}
				<Card>
					<CardHeader>
						<CardTitle>Activity Timeline</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground text-center py-8">
							Activity timeline coming soon...
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
