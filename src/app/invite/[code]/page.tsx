import { getCircleByInviteCode, joinCircleByCode } from "@/app/actions/circles";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users } from "lucide-react";

interface InvitePageProps {
  params: Promise<{ code: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { code } = await params;
  const session = await auth();
  const circle = await getCircleByInviteCode(code);

  if (!circle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Invalid Invite</h1>
        <p className="text-muted-foreground mb-8">
          This invite link looks invalid or has expired.
        </p>
        <Link href="/">
          <Button className="rounded-full">Return Home</Button>
        </Link>
      </div>
    );
  }

  // If user is not logged in, they should be redirected by middleware,
  // but if we want to show a preview first, we can.
  // The plan said middleware handles redirect, but we can double check logic.
  // Actually middleware prevents access to this page if not logged in.
  // So we can assume logged in.

  if (!session?.user) {
    // If middleware didn't catch it (e.g. public route configuration), allow preview
    // But then Join button redirects to login.
    // For now, let's assume auth is required.
    redirect(`/api/auth/signin?callbackUrl=/invite/${code}`);
  }

  const joinAction = async () => {
    "use server";
    const result = await joinCircleByCode(code);
    if (result.success) {
      redirect(`/circle/${result.circleId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-[50vw] h-[50vh] bg-purple-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[50vw] h-[50vh] bg-blue-500/10 blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full glass rounded-[2.5rem] border-white/10 p-8 md:p-12 text-center relative z-10 shadow-2xl">
        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-purple-500/20">
          {circle.name.charAt(0)}
        </div>

        <h1 className="text-3xl font-bold mb-2">{circle.name}</h1>
        <p className="text-muted-foreground mb-6">
          Invited by{" "}
          <span className="font-semibold text-foreground">
            {circle.owner.name}
          </span>
        </p>

        {circle.description && (
          <blockquote className="text-lg italic text-foreground/80 mb-8 border-l-2 border-primary/50 pl-4 text-left bg-white/5 p-4 rounded-r-xl">
            &quot;{circle.description}&quot;
          </blockquote>
        )}

        <div className="flex items-start justify-center gap-2 mb-8 text-sm text-muted-foreground bg-white/5 py-2 px-4 rounded-full mx-auto w-fit">
          <Users className="w-4 h-4 mt-0.5" />
          <span>{circle._count.members} Members</span>
        </div>

        <form action={joinAction}>
          <Button
            size="lg"
            className="w-full rounded-full h-14 text-lg font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-transform"
          >
            Join Circle
          </Button>
        </form>
        <p className="mt-6 text-xs text-muted-foreground">
          You will join as{" "}
          <span className="font-semibold text-foreground">
            {session.user.name}
          </span>
        </p>
      </div>
    </div>
  );
}
