import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { v4 as uuidv4 } from "uuid";
import { rateLimitDb } from "./rate-limit";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        deviceId: { label: "Device ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide email and password");
        }

        // Fetch user + rate limit check in parallel (2 DB calls → 1 round-trip)
        const [rateLimitResult, user] = await Promise.all([
          rateLimitDb(`login:${credentials.email.toLowerCase()}`, 5, 300_000),
          prisma.user.findUnique({ where: { email: credentials.email } }),
        ]);

        if (!rateLimitResult.success) {
          throw new Error("Too many login attempts. Please try again after 5 minutes.");
        }

        if (!user) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        if (!user.isVerified) {
          throw new Error("Please verify your email first");
        }

        if (user.status === "PENDING") {
          throw new Error("PENDING_APPROVAL");
        }

        if (user.status === "REJECTED") {
          throw new Error("Your account has been rejected by admin");
        }

        // Handle single device login
        const deviceId = credentials.deviceId || uuidv4();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Check if this device already has an active session
        const existingSession = await prisma.deviceSession.findUnique({
          where: { userId_deviceId: { userId: user.id, deviceId: deviceId } },
        });

        let sessionToken: string;

        if (existingSession && existingSession.active && existingSession.expiresAt > new Date()) {
          // Same device, already has active session — reuse the token
          sessionToken = existingSession.token;
          await prisma.deviceSession.update({
            where: { userId_deviceId: { userId: user.id, deviceId: deviceId } },
            data: { expiresAt },
          });
        } else {
          // New device or expired session — invalidate OTHER devices, create new session
          sessionToken = uuidv4();

          await Promise.all([
            prisma.deviceSession.updateMany({
              where: { userId: user.id, active: true, deviceId: { not: deviceId } },
              data: { active: false },
            }),
            prisma.deviceSession.deleteMany({
              where: { userId: user.id, expiresAt: { lt: new Date() } },
            }),
          ]);

          await prisma.deviceSession.upsert({
            where: { userId_deviceId: { userId: user.id, deviceId: deviceId } },
            update: { token: sessionToken, active: true, expiresAt },
            create: { userId: user.id, deviceId, token: sessionToken, active: true, expiresAt },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          sessionToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.sessionToken = user.sessionToken;
        token.lastRefreshed = Date.now();
      }

      // Refresh role/status from DB every 5 minutes
      const lastRefreshed = (token.lastRefreshed as number) || 0;
      if (Date.now() - lastRefreshed > 5 * 60 * 1000) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, status: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.status = dbUser.status;
          }
          token.lastRefreshed = Date.now();
        } catch {
          // On DB error, keep existing token values
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
        session.user.sessionToken = token.sessionToken as string;
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      // Invalidate server-side device session on logout
      const token = "token" in message ? message.token : null;
      if (token?.sessionToken) {
        try {
          await prisma.deviceSession.updateMany({
            where: { token: token.sessionToken as string },
            data: { active: false },
          });
        } catch {
          // Non-critical — session will expire naturally
        }
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
