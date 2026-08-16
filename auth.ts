import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  pages: { signIn: "/login" },
  callbacks: {
    authorized: async ({ auth: session }) => Boolean(session),
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "google-client-not-configured",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "google-secret-not-configured",
    }),
    Credentials({
      name: "Aphuranta access code",
      credentials: { password: { label: "Access code", type: "password" } },
      authorize(credentials) {
        const supplied = String(credentials?.password ?? "");
        const expected = process.env.ACCESS_PASSWORD ?? "";
        if (!expected || supplied.length !== expected.length) return null;
        let difference = 0;
        for (let index = 0; index < supplied.length; index += 1) {
          difference |= supplied.charCodeAt(index) ^ expected.charCodeAt(index);
        }
        return difference === 0
          ? { id: "aphuranta-team", name: "Aphuranta Team", email: "team@aphuranta.local" }
          : null;
      },
    }),
  ],
});

