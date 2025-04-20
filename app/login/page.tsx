import { LoginForm } from "@/components/login-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"

export default function LoginPage({
  searchParams,
}: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const signupSuccess = searchParams.signup === "success"

  return (
    <div className="container flex h-[calc(100vh-8rem)] items-center justify-center">
      <div className="mx-auto max-w-md space-y-6 w-full">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-muted-foreground">Enter your credentials to access your account</p>
        </div>

        {signupSuccess && (
          <Alert className="border-green-500 text-green-500">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-500">
              Account created successfully! Please sign in with your credentials.
            </AlertDescription>
          </Alert>
        )}

        <LoginForm />
      </div>
    </div>
  )
}
