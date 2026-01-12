import { auth, signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Github } from "lucide-react"
import { redirect } from "next/navigation"

export default async function SignInPage() {
  const session = await auth()
  if (session) {
    redirect("/")
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full animate-pulse delay-700" />
      
      <Card className="w-full max-w-md glass border-white/20 relative z-10 backdrop-blur-2xl bg-white/5 dark:bg-black/40">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 mb-2">
            <span className="text-2xl font-bold text-white">i</span>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome to Invito</CardTitle>
          <CardDescription className="text-base">
            Reconnect with your close ones for the moments that matter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <form
            action={async () => {
              "use server"
              await signIn("github")
            }}
          >
            <Button 
              variant="outline" 
              className="w-full h-12 text-lg font-medium border-white/20 hover:bg-white/10 transition-all duration-300 gap-3"
            >
              <Github className="w-5 h-5" />
              Continue with GitHub
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-8">
          <p className="text-xs text-center text-muted-foreground px-8">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
      
      {/* Decorative text for mobile friendly layout */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-sm font-medium text-muted-foreground/60">
          Crafted for your most special moments.
        </p>
      </div>
    </div>
  )
}
