export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  STAFF: 'Staff',
};

export const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-primary-100 text-primary-800',
  MANAGER: 'bg-yellow-100 text-yellow-800',
  STAFF: 'bg-gray-100 text-gray-800',
};
