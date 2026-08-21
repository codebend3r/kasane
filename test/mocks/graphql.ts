import { mock } from "bun:test";

// Stand-in for `graphql-request`, registered as the module by the bun test
// preload (`test/setup.ts`) so `src/api/anilist.ts` can never hit
// graphql.anilist.co under test. Tests queue fixture pages on
// `graphqlRequestMock` with `mockResolvedValueOnce`.

export const graphqlRequestMock = mock<
  (query: string, variables?: Record<string, unknown>) => Promise<unknown>
>(() =>
  Promise.reject(
    new Error(
      "unexpected AniList request — queue a fixture on graphqlRequestMock",
    ),
  ),
);

export class GraphQLClientMock {
  request = graphqlRequestMock;
}

export const gqlTag = (
  chunks: TemplateStringsArray,
  ...exprs: unknown[]
): string =>
  chunks.raw.reduce((acc, chunk, i) => `${acc}${String(exprs[i - 1])}${chunk}`);
