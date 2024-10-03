import { executeQuery } from '@/lib/db';

export async function MatchRefToken({ session }) {
  if (session) {
    const data = await executeQuery(`SELECT ref_token FROM employee WHERE employee_id = unhex(?)`, [session.user.id]);
    return true;
  } else {
    return false;
  }
}
