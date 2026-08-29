import { auth } from "../auth";

// Returns the logged-in user's id, or null if not authenticated.
// Every API route must call this and filter all queries by this id.
export async function getSessionUserId() {
  const session = await auth();
  return session?.user?.id || null;
}
