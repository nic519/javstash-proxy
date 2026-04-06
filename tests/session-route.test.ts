import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getAppAuthState } = vi.hoisted(() => ({
  getAppAuthState: vi.fn(),
}));

vi.mock('@/lib/authz', () => ({
  getAppAuthState,
}));

import { GET } from '../app/api/session/route';

describe('/api/session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the Clerk-backed auth state without legacy compatibility fields', async () => {
    getAppAuthState.mockResolvedValue({
      authenticated: true,
      userId: 'user_member',
      email: 'member@example.com',
      isAdmin: false,
    });

    const response = await GET();
    const body = await response.json();

    expect(body).toEqual({
      authenticated: true,
      userId: 'user_member',
      email: 'member@example.com',
      isAdmin: false,
    });
    expect(body).not.toHaveProperty('type');
  });
});
