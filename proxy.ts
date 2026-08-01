import { NextRequest, NextResponse } from 'next/server';

// Next's standalone server has no built-in access logging, so the
// container's log stream is silent for ordinary successful requests.
// This logs one line per request to make `az containerapp logs show
// --follow` actually show something while browsing the live site.
export function proxy(request: NextRequest) {
  const { method, nextUrl } = request;
  console.log(`[request] ${method} ${nextUrl.pathname}${nextUrl.search}`);
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
