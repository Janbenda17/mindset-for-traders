import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
  return (
    <div className="container flex h-[calc(100vh-8rem)] items-center justify-center">
      <div className="mx-auto max-w-md space-y-6 w-full">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground">Enter your information to create an account</p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
