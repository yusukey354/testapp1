import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // ログインしていない場合、ダッシュボード関連のページへのアクセスをログインページにリダイレクト
  if (!session && req.nextUrl.pathname.startsWith("/(dashboard)")) {
    const redirectUrl = new URL("/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // ログイン済みの場合、ログインページへのアクセスをダッシュボードにリダイレクト
  if (session && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/")) {
    const redirectUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: ["/", "/login", "/(dashboard)/:path*"],
}
