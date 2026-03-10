/*import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, context: any) {
  // Unwrap the dynamic route params properly
  const { params } = await context; 
  const suiteId = params?.id;

  if (!suiteId) {
    return NextResponse.json(
      { error: "Suite ID is required" },
      { status: 400 }
    );
  }

  try {
    const suite = await prisma.suite.findUnique({
      where: { id: suiteId },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        images: true,
        capacity: true,
        isActive: true,
      },
    });

    if (!suite) {
      return NextResponse.json(
        { error: "Suite not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(suite, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("Error fetching suite:", err);
    return NextResponse.json(
      { error: "Failed to fetch suite" },
      { status: 500 }
    );
  }
}
*/import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: suiteId } = await context.params;

  //console.log("Fetching suite with ID:", suiteId);

  if (!suiteId) {
    return NextResponse.json(
      { error: "Suite ID is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch full suite object with all fields
    const suite = await prisma.suite.findUnique({
      where: { id: suiteId },
      include: {
        bookings: true,        // optional: include relations if needed
        seasonalRates: true,
      },
    });

    if (!suite) {
      return NextResponse.json(
        { error: "Suite not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(suite, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("Error fetching suite:", err);
    return NextResponse.json(
      { error: "Failed to fetch suite" },
      { status: 500 }
    );
  }
}
