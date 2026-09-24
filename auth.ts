import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

type Attempt = { failures: number; blockedUntil: number };
const attempts = new Map<string, Attempt>();
const maxFailures = 5;
const blockDurationMs = 15 * 60 * 1000;

function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown-client";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  pages: { signIn: "/login" },
  callbacks: { authorized: async ({ auth: session }) => session?.user?.id === "aphuranta-owner" },
  providers: [
    Credentials({
      name: "Aphuranta access code",
      credentials: { password: { label: "Access code", type: "password" } },
      authorize(credentials, request) {
        const key = clientKey(request);
        const now = Date.now();
        const attempt = attempts.get(key);
        if (attempt?.blockedUntil && attempt.blockedUntil > now) return null;
        const supplied = String(credentials?.password ?? "").trim();
        const expected = String(process.env.ACCESS_PASSWORD ?? "").trim();
        console.warn("[auth] access password configured", { configured: Boolean(expected), length: expected.length });
        if (!expected || supplied.length !== expected.length) {
          const failures = (attempt?.failures || 0) + 1;
          attempts.set(key, { failures, blockedUntil: failures >= maxFailures ? now + blockDurationMs : 0 });
          return null;
        }
        let difference = 0;
        for (let index = 0; index < supplied.length; index += 1) difference |= supplied.charCodeAt(index) ^ expected.charCodeAt(index);
        if (difference !== 0) {
          const failures = (attempt?.failures || 0) + 1;
          attempts.set(key, { failures, blockedUntil: failures >= maxFailures ? now + blockDurationMs : 0 });
          return null;
        }
        attempts.delete(key);
        return { id: "aphuranta-owner", name: "Aphuranta Owner", email: "owner@aphuranta.local" };
      },
    }),
  ],
});
