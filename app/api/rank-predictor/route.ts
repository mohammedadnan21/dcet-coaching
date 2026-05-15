import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Fetch available years, branches, and categories for the form
export async function GET() {
  try {
    // Get distinct years
    const years = await prisma.dcetCutoff.findMany({
      select: { year: true },
      distinct: ["year"],
      orderBy: { year: "desc" },
    });

    // Get distinct branches
    const branches = await prisma.dcetCutoff.findMany({
      select: { branch: true, branchCode: true },
      distinct: ["branchCode"],
      orderBy: { branch: "asc" },
    });

    // Get distinct categories
    const categories = await prisma.dcetCutoff.findMany({
      select: { category: true },
      distinct: ["category"],
    });

    return NextResponse.json({
      years: years.map((y) => y.year),
      branches: branches.map((b) => ({ name: b.branch, code: b.branchCode })),
      categories: categories.map((c) => c.category),
    });
  } catch (error) {
    console.error("Error fetching rank predictor options:", error);
    return NextResponse.json(
      { error: "Failed to fetch options" },
      { status: 500 }
    );
  }
}

// POST - Predict colleges based on rank
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rank, category, branches, year } = body;

    if (!rank || !category || !year) {
      return NextResponse.json(
        { error: "Rank, category, and year are required" },
        { status: 400 }
      );
    }

    const rankNum = parseInt(rank);
    if (isNaN(rankNum) || rankNum < 1) {
      return NextResponse.json(
        { error: "Please enter a valid rank" },
        { status: 400 }
      );
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum)) {
      return NextResponse.json(
        { error: "Please select a valid year" },
        { status: 400 }
      );
    }

    // Build the query
    const whereClause: Record<string, unknown> = {
      year: yearNum,
      category: category,
      closingRank: {
        gte: rankNum, // User's rank should be <= closing rank
      },
    };

    // If specific branches are selected, filter by them
    if (branches && branches.length > 0) {
      whereClause.branchCode = {
        in: branches,
      };
    }

    // Find colleges where the user's rank is within the cutoff
    const eligibleColleges = await prisma.dcetCutoff.findMany({
      where: whereClause,
      take: 500,
      orderBy: [
        { collegeType: "asc" },
        { closingRank: "asc" },
      ],
    });

    // Group by college type
    const government = eligibleColleges.filter(
      (c) => c.collegeType === "Government"
    );
    const privateAided = eligibleColleges.filter(
      (c) => c.collegeType === "Private-Aided"
    );
    const privateUnaided = eligibleColleges.filter(
      (c) => c.collegeType === "Private-Unaided"
    );

    // Also find colleges where user is close (within 50 ranks)
    const nearMissColleges = await prisma.dcetCutoff.findMany({
      where: {
        year: yearNum,
        category: category,
        closingRank: {
          lt: rankNum,
          gte: rankNum - 50, // Within 50 ranks
        },
        ...(branches && branches.length > 0
          ? { branchCode: { in: branches } }
          : {}),
      },
      orderBy: { closingRank: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      rank: rankNum,
      category,
      year: yearNum,
      totalEligible: eligibleColleges.length,
      results: {
        government,
        privateAided,
        privateUnaided,
      },
      nearMiss: nearMissColleges,
    });
  } catch (error) {
    console.error("Error predicting colleges:", error);
    return NextResponse.json(
      { error: "Failed to predict colleges" },
      { status: 500 }
    );
  }
}
