import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);

  // Fix duplicated Origin header from OLS proxy
  const origin = headers.get("origin");
  if (origin && origin.includes(",")) {
    headers.set("origin", origin.split(",")[0].trim());
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
