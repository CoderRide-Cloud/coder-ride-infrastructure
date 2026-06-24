import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Github, ArrowRight, Loader } from "lucide-react";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { error } = router.query;

  // Check if user is already logged in
  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.push("/");
      }
    });
  }, [router]);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("github", {
        callbackUrl: "/",
        redirect: true,
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-3xl font-bold inline-block mb-4">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Coder Ride
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">
            Join our community and showcase your projects
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200 text-sm">
              {error === "OAuthSignin" && "Error initiating OAuth sign in"}
              {error === "OAuthCallback" && "Error during OAuth callback"}
              {error === "OAuthCreateAccount" &&
                "Could not create OAuth account"}
              {error === "EmailCreateAccount" &&
                "Could not create email account"}
              {error === "Callback" && "Error in OAuth callback handler"}
              {error === "OAuthAccountNotLinked" &&
                "Email already associated with another account"}
              {error === "EmailSignin" && "Check your email address"}
              {error === "CredentialsSignin" &&
                "Sign in with credentials failed"}
              {error === "SessionRequired" &&
                "Please sign in to access this page"}
              {![
                "OAuthSignin",
                "OAuthCallback",
                "OAuthCreateAccount",
                "EmailCreateAccount",
                "Callback",
                "OAuthAccountNotLinked",
                "EmailSignin",
                "CredentialsSignin",
                "SessionRequired",
              ].includes(error as string) && "An error occurred during sign in"}
            </p>
          </div>
        )}

        {/* Card */}
        <div className="card p-8 mb-6">
          {/* GitHub Sign In */}
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-3 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <Github size={20} />
            )}
            {isLoading ? "Signing in..." : "Sign in with GitHub"}
          </button>

          {/* Benefits */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white mb-3">
              Benefits of signing up:
            </h3>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-primary font-bold">✓</span>
              </div>
              <span className="text-sm text-slate-300">
                Showcase your GitHub projects
              </span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-primary font-bold">✓</span>
              </div>
              <span className="text-sm text-slate-300">
                Create a professional profile
              </span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-primary font-bold">✓</span>
              </div>
              <span className="text-sm text-slate-300">
                Connect with other developers
              </span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-primary font-bold">✓</span>
              </div>
              <span className="text-sm text-slate-300">
                Participate in community events
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm">
          By signing in, you agree to our{" "}
          <a
            href="#"
            className="text-primary hover:text-secondary transition-colors"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="text-primary hover:text-secondary transition-colors"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
