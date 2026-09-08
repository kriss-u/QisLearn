const API_URL = process.env.QISLEARN_API_URL ?? "http://localhost:4000/graphql";

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function graphqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  if (json.data === undefined) {
    throw new Error("GraphQL response missing data");
  }
  return json.data;
}
