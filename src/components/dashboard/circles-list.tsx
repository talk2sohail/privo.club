import { CircleWithRelations } from "@/types";
import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, CircleUser, ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { CreateCircleDialog } from "@/components/circles/create-circle-dialog";

interface CirclesListProps {
  circlesPromise: Promise<CircleWithRelations[]>;
  userId: string;
}

export function CirclesList({ circlesPromise, userId }: CirclesListProps) {
  const circles = use(circlesPromise);

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" /> My Circles
        </h3>
        {circles.length > 0 && (
          <Button variant="ghost" size="sm" className="text-muted-foreground">
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
              <div className="glass p-5 rounded-3xl border-white/5 hover:border-primary/20 hover:bg-white/5 transition-all cursor-pointer flex items-center justify-between group focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-xl font-bold text-primary relative">
                    {circle.name.charAt(0)}
                    {circle.ownerId === userId && (
                      <div
                        className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border border-background flex items-center justify-center shadow-xs"
                        title="Owner"
                      >
                        <Sparkles className="w-2 h-2 text-black fill-black" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                      {circle.name}
                      {circle.ownerId === userId && (
                        <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                          OWNER
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {circle.members?.length || 0} Members
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
  );
}
