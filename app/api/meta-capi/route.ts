import { NextRequest, NextResponse } from "next/server";
import { sendServerEvent } from "@/lib/meta";

export async function POST(req: NextRequest) {
  try {
    const { eventName, eventData } = await req.json();
    await sendServerEvent(eventName, eventData);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Meta CAPI request failed", details: e.message },
      { status: 500 },
    );
  }
}
