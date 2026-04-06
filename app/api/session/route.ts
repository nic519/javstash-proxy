import { NextResponse } from 'next/server';
import { getAppAuthState } from '@/lib/authz';

export async function GET() {
  const authState = await getAppAuthState();

  return NextResponse.json(authState);
}
