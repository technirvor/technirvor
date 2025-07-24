import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { eventName, eventData } = await req.json();
    const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

    if (!accessToken || !pixelId) {
      return NextResponse.json({ error: 'Meta CAPI credentials missing' }, { status: 500 });
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [eventData],
          event_name: eventName,
          test_event_code: process.env.META_CAPI_TEST_CODE || undefined,
        }),
      },
    );
    const result = await response.json();
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Meta CAPI request failed', details: e.message },
      { status: 500 },
    );
  }
}
