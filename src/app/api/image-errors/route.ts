import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    console.warn("[reader-image-error]", JSON.stringify({
      src: event?.src,
      page: event?.page,
      pageIndex: event?.pageIndex,
      retryCount: event?.retryCount,
      mode: event?.mode,
      occurredAt: event?.occurredAt,
      userAgent: request.headers.get("user-agent"),
    }));
  } catch {
    console.warn("[reader-image-error] invalid report");
  }

  return new NextResponse(null, { status: 204 });
}
