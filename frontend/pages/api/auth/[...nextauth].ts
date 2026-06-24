import NextAuth, { type NextAuthOptions, type User } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

declare module "next-auth" {
  interface User {
    id?: number;
    role?: string;
    customRole?: {
      id: number;
      name: string;
      permissions: string[];
      color: string;
      description?: string;
      createdAt: string;
      updatedAt: string;
    } | null;
    accessToken?: string;
  }

  interface Session {
    user?: {
      id?: number;
      role?: string;
      customRole?: {
        id: number;
        name: string;
        permissions: string[];
        color: string;
        description?: string;
        createdAt: string;
        updatedAt: string;
      } | null;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: number;
    role?: string;
    customRole?: {
      id: number;
      name: string;
      permissions: string[];
      color: string;
      description?: string;
      createdAt: string;
      updatedAt: string;
    } | null;
    accessToken?: string;
  }
}

interface GithubProfile {
  id: number;
  login: string;
  email: string | null;
  avatar_url: string;
  html_url: string;
  name: string | null;
}

interface BackendUserResponse {
  id: number;
  role: string;
  customRole?: {
    id: number;
    name: string;
    permissions: string[];
    color: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  token: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    async signIn({ user, account, profile: rawProfile }) {
      if (account?.provider === "github" && rawProfile) {
        try {
          const profile = rawProfile as unknown as GithubProfile;

          // Set basic user info from GitHub first
          user.id = profile.id;
          user.role = "PENDING"; // Default role
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

            const response = await fetch(
              `${process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL}/auth/github`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  githubId: String(profile.id),
                  username: profile.login,
                  email: profile.email,
                  avatarUrl: profile.avatar_url,
                  githubUrl: profile.html_url,
                }),
                signal: controller.signal,
              }
            );

            clearTimeout(timeoutId);

            if (response.ok) {
              const userData: BackendUserResponse = await response.json();
              user.id = userData.id;
              user.role = userData.role;
              user.customRole = userData.customRole || null; // Include customRole
              user.accessToken = userData.token;
            } else {
              console.warn(
                "Backend auth endpoint returned error:",
                response.status
              );
              // Continue with basic GitHub data
            }
          } catch (backendError) {
            console.warn("Backend unavailable during sign-in:", backendError);
            // Continue with basic GitHub data - don't fail authentication
          }
        } catch (error) {
          console.error("Unexpected error during sign in:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      // Initial sign in
      if (user && account) {
        token.id =
          typeof user.id === "string" ? parseInt(user.id, 10) : user.id;
        token.role = user.role || "PENDING";
        token.customRole = user.customRole || null; // Include customRole
        token.accessToken = user.accessToken;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.customRole = token.customRole || null; // Include customRole
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development", // Enable debug mode
};

export default NextAuth(authOptions);