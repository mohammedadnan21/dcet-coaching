import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await prisma.motivationQuote.count({ where: { active: true } });

    if (count === 0) {
      return NextResponse.json({
        quote: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
        author: "Winston Churchill",
      });
    }

    const skip = Math.floor(Math.random() * count);
    const randomQuote = await prisma.motivationQuote.findFirst({
      where: { active: true },
      skip,
    });

    return NextResponse.json(
      { quote: randomQuote!.quote, author: randomQuote!.author || "Unknown" },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" } },
    );
  } catch (error) {
    console.error("Error fetching quote:", error);
    return NextResponse.json({
      quote: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela",
    });
  }
}
