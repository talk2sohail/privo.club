import { InviteWithRelations, CircleWithRelations } from "@/types";
import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { CreateInviteDialog } from "@/components/invites/create-invite-dialog";

interface InvitesListProps {
  invitesPromise: Promise<InviteWithRelations[]>;
  circlesPromise: Promise<CircleWithRelations[]>;
  userId: string;
}

export function InvitesList({
  invitesPromise,
  circlesPromise,
  userId,
}: InvitesListProps) {
  const invites = use(invitesPromise);
  const circles = use(circlesPromise);
  const ownedCircles = circles
    .filter((c) => c.ownerId === userId)
    .map((c) => ({ id: c.id, name: c.name }));

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" /> Recent Invites
        </h3>
        {invites.length > 0 && (
          <Button variant="ghost" size="sm" className="text-muted-foreground">
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
            actionComponent={<CreateInviteDialog circles={ownedCircles} />}
          />
        ) : (
          invites.map((invite) => (
            <Link
              key={invite.id}
              href={`/event/${invite.id}`}
              className="block"
            >
              <div className="glass p-5 rounded-3xl border-white/5 hover:border-blue-500/30 hover:bg-white/5 transition-all cursor-pointer flex items-center justify-between group focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
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
                    <div className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[9px] font-bold">
                      {invite._count?.rsvps || 0}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
