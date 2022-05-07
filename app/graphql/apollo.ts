import { useMemo } from 'react';
import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client';

import { PrismaContext } from './context';

let apolloClient: ApolloClient<NormalizedCacheObject>;

function createIsomorphLink(context: PrismaContext) {
  if (typeof window === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { SchemaLink } = require('@apollo/client/link/schema')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { schema } = require('./schema')
    return new SchemaLink({ schema, context })
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { HttpLink } = require('@apollo/client/link/http')
    return new HttpLink({
      uri: '/api/graphql',
      credentials: 'same-origin',
    })
  }
}

function createApolloClient(context: PrismaContext): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: createIsomorphLink(context),
    cache: new InMemoryCache(),
  })
}

export function initializeApollo(
  initialState = {},
  context: PrismaContext
): ApolloClient<NormalizedCacheObject> {
  const _apolloClient = apolloClient ?? createApolloClient(context)

  if (initialState) {
    const existingCache = _apolloClient.extract()
    _apolloClient.cache.restore({ ...existingCache, ...initialState })
  }

  if (typeof window === 'undefined') {
    return _apolloClient
  }

  if (!apolloClient) {
    apolloClient = _apolloClient
  }

  return _apolloClient
}

export default function useApollo(initialState = {}): ApolloClient<NormalizedCacheObject> {
  const store = useMemo(() => initializeApollo(initialState), [initialState])
  return store
}