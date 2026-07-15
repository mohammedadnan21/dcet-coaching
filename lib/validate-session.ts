import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./db";

export interface ValidatedSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    sessionToken: string;
  };
}

/**
 * Validates the current session against the database.
 * Checks: JWT exists, DeviceSession is active and not expired, user still exists with correct role/status.
 * Returns null if session is invalid.
 */
export async function validateSession(): Promise<ValidatedSession | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken || !session?.user?.id) {
    return null;
  }

  const [deviceSession, user] = await Promise.all([
    prisma.deviceSession.findUnique({
      where: { token: session.user.sessionToken },
      select: { active: true, expiresAt: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, role: true, status: true },
    }),
  ]);

  if (!deviceSession || !deviceSession.active || new Date() > deviceSession.expiresAt) {
    return null;
  }

  if (!user || user.status !== "APPROVED") {
    return null;
  }

  return {
    user: {
      id: user.id,
      email: user.email || "",
      name: user.name || "",
      role: user.role,
      status: user.status,
      sessionToken: session.user.sessionToken,
    },
  };
}

/**
 * Validates session and checks if user has one of the required roles.
 * Returns null if session is invalid or role doesn't match.
 */
export async function validateSessionWithRole(
  ...allowedRoles: string[]
): Promise<ValidatedSession | null> {
  const session = await validateSession();
  if (!session) return null;
  if (!allowedRoles.includes(session.user.role)) return null;
  return session;
}
