import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { meetingSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const upcoming = searchParams.get("upcoming") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (upcoming) {
      where.scheduledAt = { gte: new Date() };
      where.cancelled = false;
    }

    const [meetings, total] = await Promise.all([
      prisma.meeting.findMany({
        where,
        skip,
        take: limit,
        include: {
          host: { select: { id: true, name: true, role: true } },
        },
        orderBy: { scheduledAt: "asc" },
      }),
      prisma.meeting.count({ where }),
    ]);

    return NextResponse.json({ items: meetings, total, page, limit });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = meetingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues?.[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { title, description, zoomLink, scheduledAt } = validation.data;

    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        zoomLink,
        scheduledAt: new Date(scheduledAt),
        hostId: session.user.id,
      },
      include: {
        host: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, zoomLink, scheduledAt, cancelled, cancelReason } = body;

    if (!id) {
      return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 });
    }

    const existingMeeting = await prisma.meeting.findUnique({ where: { id } });
    if (!existingMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && existingMeeting.hostId !== session.user.id) {
      return NextResponse.json({ error: "You can only edit your own meetings" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (zoomLink) updateData.zoomLink = zoomLink;
    if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt);
    if (cancelled !== undefined) {
      updateData.cancelled = cancelled;
      if (cancelled && cancelReason) {
        updateData.cancelReason = cancelReason;
      }
    }

    const meeting = await prisma.meeting.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(meeting);
  } catch (error) {
    console.error("Error updating meeting:", error);
    return NextResponse.json({ error: "Failed to update meeting" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 });
    }

    await prisma.meeting.delete({ where: { id } });

    return NextResponse.json({ message: "Meeting deleted successfully" });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    return NextResponse.json({ error: "Failed to delete meeting" }, { status: 500 });
  }
}
