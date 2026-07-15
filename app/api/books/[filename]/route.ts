import { NextRequest, NextResponse } from "next/server";
import { validateSessionWithRole } from "@/lib/validate-session";
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
  const session = await validateSessionWithRole("STUDENT", "ADMIN");
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
