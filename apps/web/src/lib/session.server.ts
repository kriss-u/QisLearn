import { redirect } from "react-router";
import { graphqlRequest } from "./graphqlClient";

const ME_QUERY = /* GraphQL */ `
  query Me {
    me {
      id
      email
      name
      role
    }
  }
`;

interface Me {
  id: string;
  email: string;
  name: string;
  role: string | null;
}

// The SSR-side login wall: every route except /login and /signup requires
// a session. Pages that already fetch course-scoped data (HomePage,
// LessonPage) get this for free from getTracks/getLesson throwing
// UNAUTHENTICATED; pages that don't (CoursesPage, ProfilePage) call this
// directly from their own loader instead.
export async function requireSession(request: Request, redirectTo: string): Promise<Me> {
  const cookie = request.headers.get("cookie") ?? undefined;
  const data = await graphqlRequest<{ me: Me | null }>(ME_QUERY, undefined, { cookie });
  if (!data.me) throw redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  return data.me;
}
