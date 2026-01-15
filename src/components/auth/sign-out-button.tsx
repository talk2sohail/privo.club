"use client";

import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

function SubmitButton() {
  const { pending } = useFormStatus();
 
  return (
    <Button 
      variant="outline" 
      size="sm" 
      disabled={pending}
      className={cn(
        "ml-2 rounded-full border-white/10 hover:bg-white/5 transition-all text-muted-foreground hover:text-foreground",
        pending && "opacity-70 cursor-not-allowed"
      )}
    >
      {pending ? (
        <>
            <span className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Signing out...
        </>
      ) : (
        "Sign Out"
      )}
    </Button>
  );
}

export function SignOutButton({ signOutAction }: { signOutAction: () => Promise<void> }) {
  return (
    <form action={signOutAction}>
      <SubmitButton />
    </form>
  );
}
