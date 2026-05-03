import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { videoSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subjectId = searchParams.get("subjectId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (subjectId) {
      where.subjectId = subjectId;
    }

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        skip,
        take: limit,
        include: {
          subject: { select: { id: true, name: true } },
          uploader: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.video.count({ where }),
    ]);

    return NextResponse.json({ items: videos, total, page, limit }, {
      headers: { "Cache-Control": "private, s-maxage=60, stale-while-revalidate=30" },
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = videoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues?.[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { title, description, youtubeUrl, subjectId } = validation.data;

    const video = await prisma.video.create({
      data: {
        title,
        description,
        youtubeUrl,
        subjectId,
        uploadedBy: session.user.id,
      },
      include: {
        subject: { select: { id: true, name: true } },
        uploader: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Error creating video:", error);
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, youtubeUrl, subjectId } = body;

    if (!id) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
    }

    const existingVideo = await prisma.video.findUnique({ where: { id } });
    if (!existingVideo) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && existingVideo.uploadedBy !== session.user.id) {
      return NextResponse.json({ error: "You can only edit your own videos" }, { status: 403 });
    }

    const video = await prisma.video.update({
      where: { id },
      data: { title, description, youtubeUrl, subjectId },
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error("Error updating video:", error);
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
    }

    const existingVideo = await prisma.video.findUnique({ where: { id } });
    if (!existingVideo) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && existingVideo.uploadedBy !== session.user.id) {
      return NextResponse.json({ error: "You can only delete your own videos" }, { status: 403 });
    }

    await prisma.video.delete({ where: { id } });

    return NextResponse.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}
