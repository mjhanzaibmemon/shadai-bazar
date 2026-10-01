import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from './auth';

export async function verifyAuth(request: NextRequest): Promise<{
  isValid: boolean;
  user?: TokenPayload;
  response?: NextResponse;
}> {
  try {
    // Web uses the httpOnly cookie; the mobile app sends a Bearer token.
    const bearer = request.headers.get('authorization');
    const token =
      request.cookies.get('auth_token')?.value ||
      (bearer?.startsWith('Bearer ') ? bearer.slice(7).trim() : undefined);

    if (!token) {
      return {
        isValid: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      };
    }

    const user = verifyToken(token);

    if (!user) {
      return {
        isValid: false,
        response: NextResponse.json({ error: 'Invalid token' }, { status: 401 }),
      };
    }

    return { isValid: true, user };
  } catch (error) {
    return {
      isValid: false,
      response: NextResponse.json({ error: 'Authentication failed' }, { status: 401 }),
    };
  }
}
