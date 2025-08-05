import { NextRequest, NextResponse } from "next/server";
import { sendServerEvent } from "@/lib/meta";

export async function POST(req: NextRequest) {
  try {
    const { eventName, eventData, userInfo } = await req.json();

    // Validate required parameters
    if (!eventName) {
      return NextResponse.json(
        { error: "Missing eventName parameter" },
        { status: 400 },
      );
    }

    const result = await sendServerEvent(
      eventName,
      eventData || {},
      userInfo || {},
      req,
    );

    if (!result.success) {
      console.error(`Meta CAPI event failed: ${result.error}`);
      return NextResponse.json(
        { error: "Meta CAPI event failed", details: result.error },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Meta CAPI route error:", e);
    return NextResponse.json(
      { error: "Meta CAPI request failed", details: e.message },
      { status: 500 },
    );
  }
}
