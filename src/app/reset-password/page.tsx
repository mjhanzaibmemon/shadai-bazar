import { connection } from 'next/server';
import ResetPasswordClient from './ResetPasswordClient';

// Force runtime rendering — the page is purely driven by the ?token query string.
export default async function ResetPasswordPage() {
  await connection();
  return <ResetPasswordClient />;
}
