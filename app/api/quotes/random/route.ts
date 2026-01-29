import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const quotes = await prisma.motivationQuote.findMany({
      where: { active: true },
    });

    if (quotes.length === 0) {
      return NextResponse.json({
        quote: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
        author: "Winston Churchill",
      });
    }

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    return NextResponse.json({
      quote: randomQuote.quote,
      author: randomQuote.author || "Unknown",
    });
  } catch (error) {
    console.error("Error fetching quote:", error);
    return NextResponse.json({
      quote: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela",
    });
  }
}
