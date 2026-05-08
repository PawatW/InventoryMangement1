export interface JwtPayload {
  sub: string;
  role: string;
  staffId: string;
  staffName: string;
  exp: number;
  iat: number;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const base64 = token.split('.')[1];
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return true;
  return Date.now() >= payload.exp * 1000;
}
