import { describe, expect, it } from 'vitest';
import { canAccessAdmin, canManageAdminData } from '../lib/session-permissions';

describe('admin permissions', () => {
  it('allows both logged-in roles to access the shared admin route', () => {
    expect(canAccessAdmin('admin')).toBe(true);
    expect(canAccessAdmin('javstash')).toBe(true);
    expect(canAccessAdmin(null)).toBe(false);
  });

  it('only allows admins to mutate cached data', () => {
    expect(canManageAdminData('admin')).toBe(true);
    expect(canManageAdminData('javstash')).toBe(false);
    expect(canManageAdminData(null)).toBe(false);
  });
});
