import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";

const ALLOWED_FILES = new Set([
  "DCET-2023-Wintrix-Academy.pdf",
  "DCET-2024-Wintrix-Academy.pdf",
  "DCET-2025-Wintrix-Academy.pdf",
  "DCET-2026-Wintrix-Academy.pdf",
  "DCET-2023-2026-Complete-Wintrix-Academy.pdf",
]);

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  // Use getToken — reads JWT from cookie directly, zero DB calls, very fast
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (token.role !== "STUDENT" && token.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (token.status !== "APPROVED") {
    return NextResponse.json({ error: "Account not approved" }, { status: 403 });
  }

  const filename = params.filename;
  if (!ALLOWED_FILES.has(filename)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const filePath = path.join(process.cwd(), "public", "books", filename);
    const fileStats = await stat(filePath);

    const nodeStream = createReadStream(filePath);
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk) =>
          controller.enqueue(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
        );
        nodeStream.on("end", () => controller.close());
        nodeStream.on("error", (err) => controller.error(err));
      },
      cancel() {
        nodeStream.destroy();
      },
    });

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Content-Length": fileStats.size.toString(),
        // Cache in browser for 15 min — token already verified
        "Cache-Control": "private, max-age=900",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
