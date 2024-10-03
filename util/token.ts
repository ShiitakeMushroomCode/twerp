import { auth } from '@/auth';
import { executeQuery } from '@/lib/db';

export async function MatchRefToken() {
  const session = await auth();
  if (session) {
    const data = await executeQuery(`SELECT ref_token FROM employee WHERE employee_id = unhex(?)`, [session.user.id]);
    return true;
  } else {
    return false;
  }
}
