import { describe, expect, it } from 'vitest';
import {
  createAdminDetailReadOnlyState,
  isAdminDetailReadOnly,
} from '../app/admin/_components/types';

describe('app/admin/page auth state', () => {
  it('keeps local selections editable once admin permissions load', () => {
    const selectedReadOnly = createAdminDetailReadOnlyState('local');

    expect(selectedReadOnly).toBe(false);
    expect(
      isAdminDetailReadOnly({
        selectedReadOnly,
        canManage: true,
      })
    ).toBe(false);
  });

  it('forces remote selections to remain read-only', () => {
    const selectedReadOnly = createAdminDetailReadOnlyState('remote');

    expect(selectedReadOnly).toBe(true);
    expect(
      isAdminDetailReadOnly({
        selectedReadOnly,
        canManage: true,
      })
    ).toBe(true);
  });

  it('keeps local selections read-only for non-admin users', () => {
    expect(
      isAdminDetailReadOnly({
        selectedReadOnly: createAdminDetailReadOnlyState('local'),
        canManage: false,
      })
    ).toBe(true);
  });
});
