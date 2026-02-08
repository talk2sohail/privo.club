import { UserStats } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, MessageSquare, CheckCircle } from "lucide-react";

interface ProfileStatsCardsProps {
	stats: UserStats;
}

export function ProfileStatsCards({ stats }: ProfileStatsCardsProps) {
	const cards = [
		{
			title: "Circles Owned",
			value: stats.circlesOwned,
			icon: Users,
			description: "As host",
		},
		{
			title: "Circles Joined",
			value: stats.circlesJoined,
			icon: Users,
			description: "As member",
		},
		{
			title: "Events Created",
			value: stats.eventsCreated,
			icon: Calendar,
			description: "Total invites sent",
		},
		{
			title: "Events Attended",
			value: stats.eventsAttended,
			icon: CheckCircle,
			description: "RSVP'd Yes",
		},
		{
			title: "RSVP Rate",
			value: `${Math.round(stats.rsvpResponseRate)}%`,
			icon: CheckCircle,
			description: "Response rate",
		},
		{
			title: "Posts Shared",
			value: stats.postsShared,
			icon: MessageSquare,
			description: "Feed updates",
		},
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{cards.map((card) => {
				const Icon = card.icon;
				return (
					<Card key={card.title} className="hover:shadow-lg transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								{card.title}
							</CardTitle>
							<Icon className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{card.value}</div>
							<p className="text-xs text-muted-foreground mt-1">
								{card.description}
							</p>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
