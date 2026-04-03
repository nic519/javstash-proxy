export type SessionType = 'admin' | 'javstash';

export function canAccessAdmin(type: SessionType | null): boolean {
  return type === 'admin' || type === 'javstash';
}

export function canManageAdminData(type: SessionType | null): boolean {
  return type === 'admin';
}
