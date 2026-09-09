const API_URL = process.env.QISLEARN_API_URL ?? "http://localhost:4000/graphql";

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; extensions?: { code?: string } }>;
}

export class GraphQLRequestError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

// `cookie` forwards the incoming SSR request's session cookie so apps/api
// can resolve the viewer's identity for course-entitlement checks — course
// content now requires a signed-in, entitled user (see AGENTS.md history:
// this used to be public, but no longer is), so loaders that fetch course
// content must pass the browser's original request cookie through here.
export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  opts?: { cookie?: string },
): Promise<T> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(opts?.cookie ? { cookie: opts.cookie } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    const [first] = json.errors;
    throw new GraphQLRequestError(json.errors.map((e) => e.message).join("; "), first?.extensions?.code);
  }
  if (json.data === undefined) {
    throw new Error("GraphQL response missing data");
  }
  return json.data;
}
