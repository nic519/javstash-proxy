import { describe, expect, it } from 'vitest';
import {
  canAccessAdmin,
  canManageAdminData,
  type AppAuthState,
} from '../lib/session-permissions';

describe('admin permissions', () => {
  it('allows any signed-in Clerk user to access the shared admin route', () => {
    const adminState: AppAuthState = {
      authenticated: true,
      userId: 'user_admin',
      email: 'admin@example.com',
      isAdmin: true,
    };
    const memberState: AppAuthState = {
      authenticated: true,
      userId: 'user_member',
      email: 'member@example.com',
      isAdmin: false,
    };
    const anonymousState: AppAuthState = {
      authenticated: false,
      userId: null,
      email: null,
      isAdmin: false,
    };

    expect(canAccessAdmin(adminState)).toBe(true);
    expect(canAccessAdmin(memberState)).toBe(true);
    expect(canAccessAdmin(anonymousState)).toBe(false);
  });

  it('only allows admins to mutate cached data', () => {
    const adminState: AppAuthState = {
      authenticated: true,
      userId: 'user_admin',
      email: 'admin@example.com',
      isAdmin: true,
    };
    const memberState: AppAuthState = {
      authenticated: true,
      userId: 'user_member',
      email: 'member@example.com',
      isAdmin: false,
    };
    const anonymousState: AppAuthState = {
      authenticated: false,
      userId: null,
      email: null,
      isAdmin: false,
    };

    expect(canManageAdminData(adminState)).toBe(true);
    expect(canManageAdminData(memberState)).toBe(false);
    expect(canManageAdminData(anonymousState)).toBe(false);
  });

  it('rejects inconsistent auth state objects instead of trusting userId alone', () => {
    const inconsistentState: AppAuthState = {
      authenticated: false,
      userId: 'user_admin',
      email: 'admin@example.com',
      isAdmin: true,
    };

    expect(canAccessAdmin(inconsistentState)).toBe(false);
    expect(canManageAdminData(inconsistentState)).toBe(false);
  });
});
