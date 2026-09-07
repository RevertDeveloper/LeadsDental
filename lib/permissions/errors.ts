export type AuthorizationErrorCode =
  | "UNAUTHENTICATED"
  | "INACTIVE_USER"
  | "FORBIDDEN"
  | "AUTHORIZATION_UNAVAILABLE";

const messages: Record<AuthorizationErrorCode, string> = {
  UNAUTHENTICATED: "Debes iniciar sesión para continuar.",
  INACTIVE_USER: "Tu cuenta no tiene acceso activo.",
  FORBIDDEN: "No tienes permisos para realizar esta operación.",
  AUTHORIZATION_UNAVAILABLE:
    "No se pudo validar la autorización. Inténtalo de nuevo.",
};

export class AuthorizationError extends Error {
  readonly code: AuthorizationErrorCode;
  readonly status: 401 | 403 | 503;

  constructor(code: AuthorizationErrorCode) {
    super(messages[code]);
    this.name = "AuthorizationError";
    this.code = code;
    this.status = code === "UNAUTHENTICATED" ? 401 : code === "AUTHORIZATION_UNAVAILABLE" ? 503 : 403;
  }
}
