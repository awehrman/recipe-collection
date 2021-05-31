/* eslint-disable @typescript-eslint/no-var-requires */
import { useMemo } from 'react';
import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client';

import { PrismaContext } from './context';

let apolloClient: ApolloClient<NormalizedCacheObject>;

function createIsomorphLink(context: PrismaContext = {}): any {
  if (typeof window === 'undefined') {
    const { SchemaLink } = require('@apollo/client/link/schema')
    const { schema } = require('./schema')
    return new SchemaLink({ schema, context })
  } else {
    const { HttpLink } = require('@apollo/client/link/http')
    return new HttpLink({
      uri: '/api/graphql',
      credentials: 'same-origin',
    })
  }
}

function createApolloClient(context?: PrismaContext): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: createIsomorphLink(context),
    cache: new InMemoryCache(),
  })
}

export function initializeApollo(
  initialState: any = null,
  // Pages with Next.js data fetching methods, like `getStaticProps`, can send
  // a custom context which will be used by `SchemaLink` to server render pages
  context?: PrismaContext
): ApolloClient<NormalizedCacheObject> {
  const _apolloClient = apolloClient ?? createApolloClient(context)

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // get hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract()
    // Restore the cache using the data passed from getStaticProps/getServerSideProps
    // combined with the existing cached data
    _apolloClient.cache.restore({ ...existingCache, ...initialState })
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') {return _apolloClient}
  // Create the Apollo Client once in the client
  if (!apolloClient) {apolloClient = _apolloClient}

  return _apolloClient
}

// eslint-disable-next-line
export default function useApollo(initialState: any): ApolloClient<NormalizedCacheObject> {
  const store = useMemo(() => initializeApollo(initialState), [initialState])
  return store
}