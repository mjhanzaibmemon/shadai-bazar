import { connection } from 'next/server';
import VerifyEmailClient from './VerifyEmailClient';

// Force runtime rendering — the page is purely driven by the ?token query string,
// so prerendering provides no value and triggers Turbopack chunk-emission issues.
export default async function VerifyEmailPage() {
  await connection();
  return <VerifyEmailClient />;
}
