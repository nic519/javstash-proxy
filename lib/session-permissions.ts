import type { AppAuthState } from './authz';

export type { AppAuthState } from './authz';

export type PermissionSubject = AppAuthState | null | undefined;

function hasAuthenticatedUser(subject: AppAuthState): boolean {
  return subject.authenticated && Boolean(subject.userId);
}

export function canAccessAdmin(subject: PermissionSubject): boolean {
  if (!subject) {
    return false;
  }

  return hasAuthenticatedUser(subject);
}

export function canManageAdminData(subject: PermissionSubject): boolean {
  if (!subject) {
    return false;
  }

  return hasAuthenticatedUser(subject) && subject.isAdmin;
}
