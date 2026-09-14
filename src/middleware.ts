import { NextResponse, type NextRequest } from "next/server";

/**
 * Guarda de borda: barra rotas privadas antes de renderizar qualquer página.
 *
 * Aqui só verificamos a PRESENÇA do cookie — o middleware roda no runtime de
 * borda e não tem acesso ao banco. A validação real da sessão (assinatura,
 * expiração, revogação, status da conta) acontece em cada layout/rota no
 * servidor. Esta camada é otimização e defesa em profundidade, nunca a única.
 */
const FAMILY_COOKIE = "zh_family";
const ADMIN_COOKIE = "zh_admin";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!request.cookies.has(ADMIN_COOKIE)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (pathname.startsWith("/familia") || pathname.startsWith("/kids")) {
    if (!request.cookies.has(FAMILY_COOKIE)) {
      return NextResponse.redirect(new URL("/entrar", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/familia/:path*", "/kids/:path*"],
};
