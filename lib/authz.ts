import { auth, currentUser } from '@clerk/nextjs/server';
import { isAdminEmail } from './admin-emails';

export interface AppAuthState {
  authenticated: boolean;
  userId: string | null;
  email: string | null;
  isAdmin: boolean;
}

export async function getAppAuthState(): Promise<AppAuthState> {
  const { userId } = await auth();

  if (!userId) {
    return {
      authenticated: false,
      userId: null,
      email: null,
      isAdmin: false,
    };
  }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    null;

  return {
    authenticated: true,
    userId,
    email,
    isAdmin: isAdminEmail(email),
  };
}
