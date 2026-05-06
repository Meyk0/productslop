import "server-only";

export function isAdminDeleteEnabled(): boolean {
  return Boolean(adminDeleteToken());
}

export function canAdminDelete(rawToken?: string | string[]): rawToken is string {
  const token = normalizeAdminToken(rawToken);
  const expected = adminDeleteToken();
  return Boolean(token && expected && token === expected);
}

export function normalizeAdminToken(rawToken?: string | string[]): string | undefined {
  const value = Array.isArray(rawToken) ? rawToken[0] : rawToken;
  const token = value?.trim();
  return token || undefined;
}

function adminDeleteToken(): string | undefined {
  const token = process.env.ADMIN_DELETE_TOKEN?.trim();
  return token && token.length >= 16 ? token : undefined;
}
